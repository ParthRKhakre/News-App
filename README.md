# Fake News Detection ML System

A complete, production-ready Fake News Detection ML system using the LIAR dataset. Features a modular architecture, an ensemble of traditional ML, Deep Learning (LSTM), and Transformer (DistilBERT) models, alongside a high-performance inference API.

## Project Structure

- `notebooks/`: Contains `training.ipynb` for EDA and full pipeline training blocks.
- `model_pipeline/`: Output directory where trained weights, vectorizers, and tokenizers are stored.
- `src/`: Modular python scripts for data preprocessing, modeling, ensembling, and inference.
- `tests/`: Contains pytest validation scripts.

## Setup Instructions

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Train Models (or use the provided pre-trained ones if generated):
   You can run `notebooks/training.ipynb`, and the output models will be saved into `model_pipeline/`.

3. Run Inference:
   ```python
   from src.inference import predict
   
   result = predict("Breaking news: Government announces a new policy!")
   print(result)
   ```

4. Run Tests:
   ```bash
   python -m pytest tests/
   ```
