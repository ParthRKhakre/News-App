import pytest
from src.inference import predict

def test_inference_format():
    test_input = "Breaking: Government announces new policy to cut taxes for all by 50%!"
    
    # Run prediction
    result = predict(test_input)
    
    # Assertions on output format
    assert isinstance(result, dict)
    assert 'label' in result
    assert result['label'] in ["FAKE", "REAL"]
    
    assert 'confidence' in result
    assert 0.0 <= result['confidence'] <= 1.0
    
    assert 'model_breakdown' in result
    assert isinstance(result['model_breakdown'], dict)
    
    # Model breakdown should include:
    for model_name in ["logistic", "naive_bayes", "random_forest", "lstm", "distilbert"]:
        assert model_name in result['model_breakdown']
        assert result['model_breakdown'][model_name] in ["FAKE", "REAL"]
        
    assert 'important_words' in result
    assert isinstance(result['important_words'], list)

def test_inference_empty_string():
    result = predict("   ")
    assert result['label'] == "FAKE"
    assert result['confidence'] == 0.0
    assert 'error' in result
