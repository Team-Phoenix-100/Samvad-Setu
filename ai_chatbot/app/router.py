from fastapi import APIRouter, HTTPException
from .schemes import (
    ChatRequest,
    ChatResponse,
    ClassificationRequest,
    ClassificationResponse,
    DuplicateCheckRequest,
    DuplicateCheckResponse,
    SeverityRequest,
    SeverityResponse,
    DepartmentRequest,
    DepartmentResponse
)
from .service import AIService
from .duplicate import check_duplicate
from .severity import assess_severity_and_priority
from .department import get_department

router = APIRouter(
    prefix="/api",
    tags=["AI"]
)

ai_service = AIService()


# chat responce from ai

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        answer = ai_service.generate_response(request.message)
        return ChatResponse(status="success", response=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
 
#  classify 
@router.post("/classify", response_model=ClassificationResponse)
async def classify(request: ClassificationRequest):
    try:
        result = ai_service.classify_complaint(request.text)
        return ClassificationResponse(
            category=result.get("category", "other"),
            confidence=result.get("confidence", 0.0)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")

# duplicate detection 

@router.post("/duplicate", response_model=DuplicateCheckResponse)
async def detect_duplicate(request: DuplicateCheckRequest):
    try:
        result = check_duplicate(request.text, threshold=request.threshold)
        return DuplicateCheckResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Duplicate detection error: {str(e)}")


# severity and priority assessment

@router.post("/severity", response_model=SeverityResponse)
async def assess_severity(request: SeverityRequest):
    try:
        result = assess_severity_and_priority(
            text=request.text,
            duplicate_count=request.duplicate_count or 0,
            recency=request.recency or 0.0,
            model_prediction=request.model_prediction
        )
        return SeverityResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Severity assessment error: {str(e)}")


# department recommendation

@router.post("/department", response_model=DepartmentResponse)
async def recommend_department(request: DepartmentRequest):
    try:
        dept = get_department(request.category)
        return DepartmentResponse(
            category=request.category,
            department=dept
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Department routing error: {str(e)}")
