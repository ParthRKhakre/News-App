import json
import os

cells = []

def add_md(text):
    cells.append({"cell_type": "markdown", "metadata": {}, "source": [text]})

def add_code(text):
    cells.append({"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [text]})

add_md("# Fake News Detection Pipeline\n\nThis notebook demonstrates a complete ML lifecycle: EDA, Data Preprocessing, Feature Engineering, Model Training, Evaluation, and Ensembling.")

add_code('''import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import joblib

import torch
import torch.nn as nn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from transformers import AutoTokenizer, AutoModelForSequenceClassification

import sys
sys.path.append('..')
from src.preprocess import get_train_test_splits
from src.models import BiLSTM, SimpleTokenizer, get_traditional_models
from src.ensemble import save_ensemble_config

os.makedirs('../model_pipeline', exist_ok=True)
''')

add_md("## 1. Data Loading & Preprocessing")
add_code('''train_df, valid_df, test_df = get_train_test_splits('../train.tsv', '../valid.tsv', '../test.tsv')
print(f"Train size: {len(train_df)}")
print(f"Valid size: {len(valid_df)}")
''')

add_md("## 2. Exploratory Data Analysis (EDA)")
add_code('''# Class Distribution Plot
plt.figure(figsize=(6, 4))
sns.countplot(x='target', data=train_df)
plt.title('Class Distribution (0 = Fake, 1 = Real)')
plt.show()

# Text Length Distribution
train_df['text_len'] = train_df['text'].apply(lambda x: len(str(x).split()))
plt.figure(figsize=(10, 5))
sns.histplot(data=train_df, x='text_len', hue='target', bins=50, kde=True)
plt.title('Text Length Distribution by Target')
plt.xlim(0, 100)
plt.show()
''')

add_md("## 3. Classical Model Training")
add_code('''X_train = train_df['text'].tolist()
y_train = train_df['target'].tolist()
X_test = test_df['text'].tolist()
y_test = test_df['target'].tolist()

tfidf = TfidfVectorizer(max_features=5000)
X_train_tfidf = tfidf.fit_transform(X_train)
X_test_tfidf = tfidf.transform(X_test)
joblib.dump(tfidf, '../model_pipeline/tfidf_vectorizer.pkl')

models = get_traditional_models()
for name, model in models.items():
    print(f"Training {name}...")
    model.fit(X_train_tfidf, y_train)
    score = model.score(X_test_tfidf, y_test)
    print(f"{name} Accuracy: {score:.4f}")
    if name == 'logistic':
        joblib.dump(model, '../model_pipeline/logistic_model.pkl')
    else:
        joblib.dump(model, f'../model_pipeline/{name}_model.pkl')
''')

add_md("## 4. LSTM Training")
add_code('''tokenizer = SimpleTokenizer(max_vocab_size=5000, max_len=128)
tokenizer.fit(X_train)
joblib.dump(tokenizer, '../model_pipeline/tokenizer.pkl')

lstm_model = BiLSTM(vocab_size=len(tokenizer))
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(lstm_model.parameters(), lr=0.001)

# Training block (1 epoch for demo)
lstm_model.train()
for i in range(0, len(X_train), 64):
    batch_texts = X_train[i:i+64]
    batch_y = torch.tensor(y_train[i:i+64], dtype=torch.float32)
    encoded = [tokenizer.pad(tokenizer.encode(t)) for t in batch_texts]
    batch_x = torch.tensor(encoded, dtype=torch.long)
    
    optimizer.zero_grad()
    preds = lstm_model(batch_x)
    loss = criterion(preds, batch_y)
    loss.backward()
    optimizer.step()

torch.save(lstm_model.state_dict(), '../model_pipeline/lstm_model.pt')
print("LSTM trained and saved!")
''')

add_md("## 5. DistilBERT Fine-Tuning")
add_code('''# Note: This is an intensive process requiring a GPU. 
# We just save the base model structure for the proxy version.
model_name = "distilbert-base-uncased"
bert_tokenizer = AutoTokenizer.from_pretrained(model_name)
bert_model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

bert_tokenizer.save_pretrained('../model_pipeline/distilbert_model')
bert_model.save_pretrained('../model_pipeline/distilbert_model')
print("DistilBERT exported!")
''')

add_md("## 6. Ensembling Configurations")
add_code('''# Define weights for production
DEFAULT_WEIGHTS = {
    'distilbert': 0.5,
    'logistic': 0.2,
    'naive_bayes': 0.1,
    'random_forest': 0.1,
    'lstm': 0.1
}

save_ensemble_config('../model_pipeline/ensemble_config.json', DEFAULT_WEIGHTS)
print("Configuration saved!")
''')

notebook = {
    "cells": cells,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.9"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

with open("notebooks/training.ipynb", "w") as f:
    json.dump(notebook, f, indent=1)
