import os
import joblib
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np

from src.preprocess import clean_text
from src.ensemble import load_ensemble_config, predict_ensemble, get_label_str
from src.models import BiLSTM

class FakeNewsModelServer:
    """Singleton pattern to keep models loaded for fast <2 seconds inference."""
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(FakeNewsModelServer, cls).__new__(cls)
            cls._instance._is_initialized = False
        return cls._instance

    def __init__(self, model_dir="model_pipeline"):
        if self._is_initialized:
            return
            
        self.model_dir = model_dir
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.cache = {} # Mock Redis in-memory cache
        
        self.tfidf = None
        self.lr = None
        self.nb = None
        self.rf = None
        
        self.lstm_vocab = None
        self.lstm_model = None
        
        self.bert_tokenizer = None
        self.bert_model = None
        
        self.weights = None
        self.active_models = set()
        self._is_initialized = True
        self._models_loaded = False

    def load_models(self):
        """Lazy load models."""
        if self._models_loaded:
            return
            
        print("Loading models into memory...")
        # Load sklearn artifacts
        self.tfidf = joblib.load(os.path.join(self.model_dir, 'tfidf_vectorizer.pkl'))
        self.lr = joblib.load(os.path.join(self.model_dir, 'logistic_model.pkl'))
        self.nb = joblib.load(os.path.join(self.model_dir, 'naive_bayes_model.pkl'))
        self.rf = joblib.load(os.path.join(self.model_dir, 'random_forest_model.pkl'))

        self.weights = load_ensemble_config(os.path.join(self.model_dir, 'ensemble_config.json'))
        self.active_models = {
            model_name
            for model_name, weight in self.weights.items()
            if weight > 0
        }
        
        # Load LSTM only if it participates in the live ensemble.
        if 'lstm' in self.active_models and os.path.exists(os.path.join(self.model_dir, 'lstm_model.pt')):
            self.lstm_vocab = joblib.load(os.path.join(self.model_dir, 'tokenizer.pkl'))
            self.lstm_model = BiLSTM(vocab_size=len(self.lstm_vocab)).to(self.device)
            self.lstm_model.load_state_dict(torch.load(os.path.join(self.model_dir, 'lstm_model.pt'), map_location=self.device))
            self.lstm_model.eval()
        
        # Load DistilBERT only if it participates in the live ensemble.
        bert_path = os.path.join(self.model_dir, 'distilbert_model')
        if 'distilbert' in self.active_models and os.path.isdir(bert_path):
            self.bert_tokenizer = AutoTokenizer.from_pretrained(bert_path)
            self.bert_model = AutoModelForSequenceClassification.from_pretrained(bert_path).to(self.device)
            self.bert_model.eval()
        
        self._models_loaded = True
        print("Models loaded successfully!")

    def explain_tfidf(self, text, top_n=3):
        """Extract important words using TF-IDF."""
        tfidf_vec = self.tfidf.transform([text])
        if tfidf_vec.nnz == 0:
            return []
        
        indices = np.argsort(tfidf_vec.toarray()[0])[::-1]
        feature_names = self.tfidf.get_feature_names_out()
        return [feature_names[i] for i in indices[:top_n] if tfidf_vec.toarray()[0][i] > 0]

    def predict(self, text: str) -> dict:
        """Main inference pipeline."""
        # Check cache
        cache_key = text.strip().lower()
        if cache_key in self.cache:
            return self.cache[cache_key]
            
        self.load_models()
        cleaned_text = clean_text(text)
        
        # If empty text
        if not cleaned_text:
            return {"label": "FAKE", "confidence": 0.0, "error": "Empty or invalid input."}
            
        # 1. Classical Model Predictions
        X_tfidf = self.tfidf.transform([cleaned_text])
        # Probability of class 1 (REAL)
        probabilities = {
            'logistic': self.lr.predict_proba(X_tfidf)[0][1],
            'naive_bayes': self.nb.predict_proba(X_tfidf)[0][1],
            'random_forest': self.rf.predict_proba(X_tfidf)[0][1],
        }
        
        # 2. LSTM Prediction
        if 'lstm' in self.active_models and self.lstm_model is not None and self.lstm_vocab is not None:
            encoded = self.lstm_vocab.encode(cleaned_text)
            padded = self.lstm_vocab.pad(encoded)
            input_tensor = torch.tensor([padded], dtype=torch.long).to(self.device)
            with torch.no_grad():
                probabilities['lstm'] = self.lstm_model(input_tensor).item()
            
        # 3. DistilBERT Prediction
        if 'distilbert' in self.active_models and self.bert_model is not None and self.bert_tokenizer is not None:
            bert_inputs = self.bert_tokenizer(cleaned_text, return_tensors="pt", truncation=True, padding=True, max_length=128)
            bert_inputs = {k: v.to(self.device) for k, v in bert_inputs.items() if k != 'return_tensors'}
            with torch.no_grad():
                outputs = self.bert_model(**bert_inputs)
                logits = outputs.logits
                probabilities['distilbert'] = F.softmax(logits, dim=1)[0][1].item()
            
        ensemble_prob_real = predict_ensemble(probabilities, self.weights)
        
        # Determine labels
        # Probability here is P(REAL). 
        # If P(REAL) > 0.5 -> "REAL",  else "FAKE"
        final_label = get_label_str(ensemble_prob_real)
        
        # Build confidence: If FAKE, confidence is P(FAKE) = 1.0 - P(REAL)
        confidence = ensemble_prob_real if final_label == "REAL" else 1.0 - ensemble_prob_real
        
        model_breakdown = {
            model_name: get_label_str(probability)
            for model_name, probability in probabilities.items()
        }
        
        response = {
            "label": final_label,
            "confidence": round(float(confidence), 4),
            "model_breakdown": model_breakdown,
            "important_words": self.explain_tfidf(cleaned_text)
        }
        
        # Save to mock cache
        self.cache[cache_key] = response
        return response

# Exported module-level singleton helper
server = FakeNewsModelServer()

def predict(text: str) -> dict:
    """Wrapper accessible cleanly from external files or FastAPI."""
    return server.predict(text)
