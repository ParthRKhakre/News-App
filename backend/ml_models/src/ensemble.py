import numpy as np
import json
from itertools import product
from sklearn.metrics import f1_score, accuracy_score

DEFAULT_WEIGHTS = {
    'distilbert': 0.5,
    'logistic': 0.2,
    'naive_bayes': 0.1,
    'random_forest': 0.1,
    'lstm': 0.1
}

def predict_ensemble(predictions: dict, weights: dict = None) -> float:
    """
    Combines independent probability predictions using weighted averaging.
    Expects predictions to be the probability of the text being REAL (class 1).
    
    predictions: dict of {model_name: probability_of_class_1}
    weights: dict of {model_name: weight}
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS
        
    weighted_sum = 0.0
    total_weight = 0.0
    
    for model_name, prob in predictions.items():
        if model_name in weights:
            weight = weights[model_name]
            weighted_sum += prob * weight
            total_weight += weight
            
    if total_weight == 0:
        raise ValueError("No matching models found in weights configuration.")
        
    return weighted_sum / total_weight

def get_label_str(probability: float, threshold: float = 0.5) -> str:
    """Converts a probability representing REAL class into a FAKE/REAL string."""
    return "REAL" if probability >= threshold else "FAKE"

def save_ensemble_config(filepath: str, weights: dict = None):
    if weights is None:
        weights = DEFAULT_WEIGHTS
    with open(filepath, 'w') as f:
        json.dump(weights, f, indent=4)
        
def load_ensemble_config(filepath: str) -> dict:
    with open(filepath, 'r') as f:
        raw = json.load(f)
    return raw.get("weights", raw)

def optimize_ensemble_weights(predictions: dict, targets, step: int = 1) -> dict:
    """
    Grid-search integer weight proportions on the validation split.
    Returns normalized weights for the provided prediction arrays.
    """
    model_names = list(predictions.keys())
    if not model_names:
        raise ValueError("No model predictions were provided for weight optimization.")

    grid = range(0, 11, step)
    best_score = None
    best_weights = None
    targets = np.asarray(targets)

    for candidate in product(grid, repeat=len(model_names)):
        total = sum(candidate)
        if total == 0:
            continue

        weights = {
            name: raw_weight / total
            for name, raw_weight in zip(model_names, candidate)
            if raw_weight > 0
        }
        combined = sum(np.asarray(predictions[name]) * weight for name, weight in weights.items())
        labels = (combined >= 0.5).astype(int)
        score = (
            f1_score(targets, labels),
            accuracy_score(targets, labels),
            -len(weights),
        )
        if best_score is None or score > best_score:
            best_score = score
            best_weights = weights

    if best_weights is None:
        raise ValueError("Failed to optimize ensemble weights.")
    return best_weights
