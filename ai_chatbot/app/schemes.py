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
    needsHumanReview: bool = False

class HumanFeedbackRequest(BaseModel):
    complaint: str
    predicted_category: str
    correct_category: str
    timestamp: Optional[str] = None

class HumanFeedbackResponse(BaseModel):
    status: str
    message: str
    total_records: int

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

class InternalClassifyRequest(BaseModel):
    complaint: Optional[str] = None
    text: Optional[str] = None
    duplicate_count: Optional[int] = 0
    recency: Optional[float] = 0.0
    severity: Optional[str] = None
    model_prediction: Optional[str] = None

class InternalClassifyResponse(BaseModel):
    category: str
    confidence: float
    needsHumanReview: bool
    severity: str
    priority: int
    department: str

class InternalDedupRequest(BaseModel):
    complaint: Optional[str] = None
    text: Optional[str] = None
    threshold: Optional[float] = 0.85

class InternalDedupResponse(BaseModel):
    isDuplicate: bool
    similarity: float
    matchedComplaintId: Optional[str] = None
    matchedComplaintText: Optional[str] = None

class InternalChatbotRequest(BaseModel):
    message: Optional[str] = None
    query: Optional[str] = None
    user_id: Optional[str] = None

class InternalChatbotResponse(BaseModel):
    response: str
    matched: Optional[bool] = None
    similarity: Optional[float] = None

class InternalHealthResponse(BaseModel):
    status: str
    service: str
    version: str

