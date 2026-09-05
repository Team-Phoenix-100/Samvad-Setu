from typing import Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    status: str
    response: str

class ClassificationRequest(BaseModel):
    text: str

class ClassificationResponse(BaseModel):
    category: str
    confidence: float

class DuplicateCheckRequest(BaseModel):
    text: str
    threshold: Optional[float] = 0.85

class DuplicateCheckResponse(BaseModel):
    isDuplicate: bool
    similarity: float
    matchedComplaintId: Optional[str] = None
    matchedComplaintText: Optional[str] = None

class SeverityRequest(BaseModel):
    text: str
    duplicate_count: Optional[int] = 0
    recency: Optional[float] = 0.0
    model_prediction: Optional[str] = None

class SeverityResponse(BaseModel):
    severity: str
    priority: int

class DepartmentRequest(BaseModel):
    category: str

class DepartmentResponse(BaseModel):
    category: str
    department: str
