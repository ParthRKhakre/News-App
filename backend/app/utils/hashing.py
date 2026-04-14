import hashlib

def generate_text_hash(text: str) -> str:
    """Generate SHA256 hash of input text for blockchain storage."""
    # Ensure uniform hashing
    normalized = text.strip().lower()
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()
