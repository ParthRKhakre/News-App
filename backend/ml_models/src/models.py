import torch
import torch.nn as nn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from transformers import AutoModelForSequenceClassification

def get_traditional_models():
    """Return dictionary of traditional ML models."""
    return {
        'logistic': LogisticRegression(max_iter=3000, class_weight='balanced', C=2.0),
        'naive_bayes': MultinomialNB(alpha=0.5),
        'random_forest': RandomForestClassifier(
            n_estimators=160,
            random_state=42,
            n_jobs=-1,
            class_weight='balanced_subsample',
            max_depth=32,
            min_samples_leaf=2,
        )
    }

def get_tfidf_vectorizer(max_features=5000):
    return TfidfVectorizer(max_features=max_features)

class BiLSTM(nn.Module):
    def __init__(self, vocab_size, padding_idx=0, embedding_dim=100, hidden_dim=128, output_dim=1):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=padding_idx)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.fc = nn.Linear(hidden_dim * 2, output_dim)
        
    def forward(self, x):
        # x.shape = (batch_size, seq_len)
        embedded = self.embedding(x)
        
        # output.shape = (batch_size, seq_len, num_directions * hidden_size)
        output, (hidden, cell) = self.lstm(embedded)
        
        # hidden.shape = (num_layers * num_directions, batch_size, hidden_size)
        # We concatenate the final forward and backward states
        hidden_fwd = hidden[-2, :, :]
        hidden_bwd = hidden[-1, :, :]
        combined_hidden = torch.cat((hidden_fwd, hidden_bwd), dim=1)
        
        # fc layer
        out = self.fc(combined_hidden)
        # Use sigmoid for binary classification
        return torch.sigmoid(out).squeeze(-1)

def get_distilbert_model(num_labels=2):
    """Instantiate a DistilBERT sequence classifier for fine tuning."""
    model = AutoModelForSequenceClassification.from_pretrained(
        'distilbert-base-uncased', num_labels=num_labels
    )
    return model

class SimpleTokenizer:
    """Minimal wrapper for integer encoding sequences for PyTorch LSTM."""
    def __init__(self, max_vocab_size=10000, max_len=128, pad_token="<pad>", unk_token="<unk>"):
        self.word2idx = {pad_token: 0, unk_token: 1}
        self.idx2word = {0: pad_token, 1: unk_token}
        self.max_vocab_size = max_vocab_size
        self.max_len = max_len
        self.pad_token = pad_token
        self.unk_token = unk_token
        
    def fit(self, texts):
        from collections import Counter
        all_words = []
        for text in texts:
            all_words.extend(text.split())
        counts = Counter(all_words)
        
        for word, count in counts.most_common(self.max_vocab_size - 2):
            idx = len(self.word2idx)
            self.word2idx[word] = idx
            self.idx2word[idx] = word
            
    def encode(self, text):
        return [self.word2idx.get(w, self.word2idx[self.unk_token]) for w in text.split()]
        
    def pad(self, tokens):
        if len(tokens) >= self.max_len:
            return tokens[:self.max_len]
        return tokens + [self.word2idx[self.pad_token]] * (self.max_len - len(tokens))

    def __len__(self):
        return len(self.word2idx)
