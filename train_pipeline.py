import os
import shutil
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, f1_score

from src.preprocess import get_train_test_splits
from src.models import get_traditional_models
from src.ensemble import save_ensemble_config, optimize_ensemble_weights

DEFAULT_TFIDF_CONFIG = {
    "max_features": 30000,
    "ngram_range": (1, 2),
    "min_df": 2,
    "sublinear_tf": True,
}

DEFAULT_CLASSICAL_WEIGHTS = {
    "logistic": 0.53,
    "naive_bayes": 0.29,
    "random_forest": 0.18,
}

def _score_split(probabilities, targets):
    labels = (probabilities >= 0.5).astype(int)
    return {
        "accuracy": round(float(accuracy_score(targets, labels)), 4),
        "f1": round(float(f1_score(targets, labels)), 4),
    }

def _mirror_artifacts(source_dir: str, destination_dir: str):
    if os.path.abspath(source_dir) == os.path.abspath(destination_dir):
        return
    if os.path.exists(destination_dir):
        shutil.rmtree(destination_dir)
    shutil.copytree(source_dir, destination_dir)

def train_and_save_pipeline(
    train_path,
    valid_path,
    test_path,
    model_dir,
    mirror_dir=os.path.join("backend", "ml_models", "model_pipeline"),
):
    if os.path.exists(model_dir):
        shutil.rmtree(model_dir)
    os.makedirs(model_dir, exist_ok=True)
    
    # 1. Load Data
    print("Loading data...")
    train_df, valid_df, test_df = get_train_test_splits(train_path, valid_path, test_path)

    X_train_text = train_df['text'].tolist()
    y_train = train_df['target'].tolist()
    X_valid_text = valid_df['text'].tolist()
    y_valid = valid_df['target'].tolist()
    X_test_text = test_df['text'].tolist()
    y_test = test_df['target'].tolist()
    
    # 2. Classical Models
    print("Training full-data classical models...")
    tfidf = TfidfVectorizer(**DEFAULT_TFIDF_CONFIG)
    X_train_tfidf = tfidf.fit_transform(X_train_text)
    X_valid_tfidf = tfidf.transform(X_valid_text)
    X_test_tfidf = tfidf.transform(X_test_text)
    
    models = get_traditional_models()
    validation_probs = {}
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train_tfidf, y_train)
        joblib.dump(model, os.path.join(model_dir, f"{name}_model.pkl" if name != 'logistic' else "logistic_model.pkl"))
        validation_probs[name] = model.predict_proba(X_valid_tfidf)[:, 1]
        test_scores = _score_split(model.predict_proba(X_test_tfidf)[:, 1], y_test)
        print(f"{name} test metrics: {test_scores}")
        
    joblib.dump(tfidf, os.path.join(model_dir, 'tfidf_vectorizer.pkl'))
    
    # 3. Ensemble config
    try:
        tuned_weights = optimize_ensemble_weights(validation_probs, y_valid)
    except Exception:
        tuned_weights = DEFAULT_CLASSICAL_WEIGHTS
    print("Selected ensemble weights:", tuned_weights)
    save_ensemble_config(os.path.join(model_dir, 'ensemble_config.json'), tuned_weights)

    _mirror_artifacts(model_dir, mirror_dir)
    
    print("Pipeline complete! All models saved to", model_dir)

if __name__ == "__main__":
    train_and_save_pipeline("train.tsv", "valid.tsv", "test.tsv", "model_pipeline")
