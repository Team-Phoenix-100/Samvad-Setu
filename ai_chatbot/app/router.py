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
    DepartmentResponse,
    HumanFeedbackRequest,
    HumanFeedbackResponse
)
from .service import AIService
from .duplicate import check_duplicate
from .severity import assess_severity_and_priority
from .department import get_department
from .feedback import check_needs_human_review, save_human_feedback
from .chatbot import answer_faq_query

router = APIRouter(
    prefix="/api",
    tags=["AI"]
)

ai_service = AIService()


# chat response from offline FAQ chatbot (no paid LLM required)

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        answer = answer_faq_query(request.message)
        return ChatResponse(status="success", response=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
 
# classify with human review check
@router.post("/classify", response_model=ClassificationResponse)
async def classify(request: ClassificationRequest):
    try:
        result = ai_service.classify_complaint(request.text)
        conf = float(result.get("confidence", 0.0))
        needs_review = check_needs_human_review(conf)
        return ClassificationResponse(
            category=result.get("category", "other"),
            confidence=conf,
            needsHumanReview=needs_review
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


# human review feedback / corrections

@router.post("/feedback", response_model=HumanFeedbackResponse)
async def submit_human_feedback(request: HumanFeedbackRequest):
    try:
        res = save_human_feedback(
            complaint=request.complaint,
            predicted_category=request.predicted_category,
            correct_category=request.correct_category,
            timestamp=request.timestamp
        )
        return HumanFeedbackResponse(
            status="success",
            message=res["message"],
            total_records=res["total_records"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback submission error: {str(e)}")

