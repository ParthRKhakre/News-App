from pydantic import BaseModel, ConfigDict, Field
from typing import List, Dict, Union, Optional

class HealthResponse(BaseModel):
    status: str

class GeminiSource(BaseModel):
    title: str
    url: str

class GeminiAnalysis(BaseModel):
    provider: str
    model: str
    grounded: bool = False
    search_queries: List[str] = Field(default_factory=list)
    sources: List[GeminiSource] = Field(default_factory=list)
    summary: str
    suspicious_signals: List[str] = Field(default_factory=list)
    verification_guidance: List[str] = Field(default_factory=list)
    contradiction_risk: str
    second_opinion_label: Optional[str] = None
    second_opinion_confidence: Optional[float] = None
    note: Optional[str] = None

class PredictResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    label: str
    confidence: float
    model_breakdown: Optional[Dict[str, str]] = None
    important_words: Optional[List[str]] = None
    explanation: Optional[str] = None
    ai_analysis: Optional[GeminiAnalysis] = None
    error: Optional[str] = None

class PredictStoreResponse(PredictResponse):
    txHash: str
    hash: str
    blockNumber: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class ProfileResponse(BaseModel):
    username: str
    role: str
    history: List[Dict[str, Union[str, float, None]]] = Field(default_factory=list)


class AnalyticsResponse(BaseModel):
    total_checked: int
    fake_count: int
    real_count: int
    fake_percentage: float
    top_keywords: List[str] = Field(default_factory=list)


class VerifyRecordResponse(BaseModel):
    contentHash: str
    result: str
    confidence: int
    timestamp: int
    txHash: Optional[str] = None
    blockNumber: Optional[int] = None
