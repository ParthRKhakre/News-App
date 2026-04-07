from pydantic import BaseModel
from typing import Optional

class PredictRequest(BaseModel):
    text: str
    subject: Optional[str] = None
    context: Optional[str] = None
    speaker: Optional[str] = None
    party_affiliation: Optional[str] = None
    job_title: Optional[str] = None
    state_info: Optional[str] = None

class PredictStoreRequest(PredictRequest):
    # Additional future fields for storing
    pass

class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    username: str
    password: str
