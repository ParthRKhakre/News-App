import pandas as pd
import numpy as np
import re

LIAR_COLUMNS = [
    'id', 'label', 'statement', 'subject', 'speaker', 'job_title',
    'state_info', 'party_affiliation', 'barely_true_counts',
    'false_counts', 'half_true_counts', 'mostly_true_counts',
    'pants_on_fire_counts', 'context'
]

def load_data(filepath: str) -> pd.DataFrame:
    """Load LIAR dataset TSV file."""
    return pd.read_csv(filepath, sep='\t', header=None, names=LIAR_COLUMNS)

def clean_text(text: str) -> str:
    """Lowercase, remove URLs, HTML tags, and special characters."""
    if not isinstance(text, str):
        return ""
    
    text = text.lower()
    # Remove HTML
    text = re.sub(r'<[^>]+>', '', text)
    # Remove URLs
    text = re.sub(r'http\S+', '', text)
    # Remove special chars (keep alphanumeric and spaces)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def preprocess_df(df: pd.DataFrame) -> pd.DataFrame:
    """Apply feature engineering, handle missing values, map labels."""
    # Handle missing values
    df['statement'] = df['statement'].fillna('')
    df['subject'] = df['subject'].fillna('')
    df['context'] = df['context'].fillna('')
    df['speaker'] = df['speaker'].fillna('')
    df['party_affiliation'] = df['party_affiliation'].fillna('')
    df['job_title'] = df['job_title'].fillna('')
    df['state_info'] = df['state_info'].fillna('')
    
    # Feature engineering: keep the original statement while adding the
    # structured LIAR metadata that often carries strong credibility signals.
    df['text'] = (
        df['statement']
        + " [SUBJECT] " + df['subject']
        + " [CONTEXT] " + df['context']
        + " [SPEAKER] " + df['speaker']
        + " [PARTY] " + df['party_affiliation']
        + " [ROLE] " + df['job_title']
        + " [STATE] " + df['state_info']
    )
    
    # Clean combined text
    df['text'] = df['text'].apply(clean_text)
    
    # Label Mapping
    # FAKE -> false, barely-true, pants-fire
    # REAL -> mostly-true, true
    # User didn't specify half-true, we will drop 'half-true' to keep cleanly binary, or map to REAL.
    # Let's map half-true to REAL as it contains 'true' logic or drop it. 
    # Let's drop half-true to be safe, as it wasn't specified.
    df = df[df['label'].isin(['false', 'barely-true', 'pants-fire', 'mostly-true', 'true'])].copy()
    
    label_map = {
        'false': 0, 'barely-true': 0, 'pants-fire': 0,
        'mostly-true': 1, 'true': 1
    }
    df['target'] = df['label'].map(label_map)
    return df

def get_train_test_splits(train_path: str, valid_path: str, test_path: str):
    """Loads, preprocesses, and returns train, valid, and test data."""
    train_df = preprocess_df(load_data(train_path))
    valid_df = preprocess_df(load_data(valid_path))
    test_df = preprocess_df(load_data(test_path))
    return train_df, valid_df, test_df
