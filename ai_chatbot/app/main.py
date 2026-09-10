"""
Module: app.main
Description: FastAPI AI-Service Application for Samvad-Setu.
Provides internal endpoints for Node.js backend integration:
- POST /internal/ai/classify
- POST /internal/ai/dedup
- POST /internal/ai/chatbot/message
- POST /internal/ai/feedback
- GET  /internal/health
"""

import os
import sys
import logging
from typing import Dict, Any, Tuple

# Support dual-invocation (from ai_chatbot root or ai_chatbot/app directory)
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
for p in [parent_dir, current_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.schemes import (
        InternalClassifyRequest,
        InternalClassifyResponse,
        InternalDedupRequest,
        InternalDedupResponse,
        InternalChatbotRequest,
        InternalChatbotResponse,
        InternalHealthResponse,
        HumanFeedbackRequest,
        HumanFeedbackResponse,
    )
    from app.service import AIService
    from app.classifier import classify as local_classify, get_classifier
    from app.duplicate import check_duplicate, get_duplicate_detector
    from app.severity import assess_severity_and_priority
    from app.department import get_department
    from app.feedback import check_needs_human_review, save_human_feedback
    from app.chatbot import get_faq_chatbot
    from app.router import router as ai_router
except ImportError:
    from schemes import (
        InternalClassifyRequest,
        InternalClassifyResponse,
        InternalDedupRequest,
        InternalDedupResponse,
        InternalChatbotRequest,
        InternalChatbotResponse,
        InternalHealthResponse,
        HumanFeedbackRequest,
        HumanFeedbackResponse,
    )
    from service import AIService
    from classifier import classify as local_classify, get_classifier
    from duplicate import check_duplicate, get_duplicate_detector
    from severity import assess_severity_and_priority
    from department import get_department
    from feedback import check_needs_human_review, save_human_feedback
    from chatbot import get_faq_chatbot
    from router import router as ai_router

logger = logging.getLogger(__name__)


# ==============================================================================
# APPLICATION LIFESPAN (Pre-load models once at application startup)
# ==============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Loads all AI models and FAISS indexes ONCE during application startup.
    Ensures models are resident in memory and NOT reloaded on every API request.
    """
    logger.info("Initializing Samvad-Setu AI Service: Pre-loading all models into memory...")
    try:
        get_classifier()
        logger.info("Complaint classifier loaded successfully.")
    except Exception as e:
        logger.warning(f"Complaint classifier initialization notice: {e}")

    try:
        get_duplicate_detector()
        logger.info("Duplicate detector and FAISS complaints index loaded successfully.")
    except Exception as e:
        logger.warning(f"Duplicate detector initialization notice: {e}")

    try:
        get_faq_chatbot()
        logger.info("FAQ chatbot and FAISS FAQ index loaded successfully.")
    except Exception as e:
        logger.warning(f"FAQ chatbot initialization notice: {e}")

    logger.info("Startup complete: All AI models and FAISS indexes are resident in memory.")
    yield
    logger.info("Shutting down Samvad-Setu AI Service.")


app = FastAPI(
    title="Samvad-Setu AI Service",
    description="Internal AI-service endpoints for Node.js backend communication.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for internal microservice communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include existing API router for backward compatibility
app.include_router(ai_router)

ai_service = AIService()


def _predict_category_and_confidence(text: str) -> Tuple[str, float, Any]:
    """
    Predicts category, confidence, and optional AI severity for complaint text.
    First attempts Gemini AIService if configured and active;
    gracefully falls back to local multilingual TF-IDF classifier.
    """
    # 1. Attempt Gemini if client is initialized
    try:
        if ai_service.client:
            res = ai_service.classify_complaint(text)
            cat = str(res.get("category", "")).strip().lower()
            conf = float(res.get("confidence", 0.0))
            ai_sev = res.get("severity")
            if cat and cat != "other" and conf > 0.0:
                return cat, conf, ai_sev
    except Exception as e:
        logger.warning(f"AIService Gemini error ({e}); falling back to local classifier.")

    # 2. Local Multilingual Classifier Fallback
    try:
        loc_res = local_classify(text)
        cat = str(loc_res.get("category", "other")).strip().lower()
        conf = float(loc_res.get("confidence", 0.0))
        return cat, conf, None
    except Exception as e:
        logger.error(f"Local classification error: {e}")
        return "other", 0.0, None


# ==============================================================================
# INTERNAL AI-SERVICE ENDPOINTS FOR NODE.JS
# ==============================================================================

@app.get("/internal/health", response_model=InternalHealthResponse, tags=["Internal AI"])
async def internal_health():
    """
    Health check endpoint for Node.js backend to verify AI service availability.
    """
    return InternalHealthResponse(status="ok")


@app.post("/internal/ai/classify", response_model=InternalClassifyResponse, tags=["Internal AI"])
async def internal_classify(request: InternalClassifyRequest):
    """
    Unified complaint classification endpoint.
    
    Combines:
    1. category (10 official categories or 'other')
    2. confidence (0.0 to 1.0)
    3. needsHumanReview (true if confidence < 0.70)
    4. severity ('Critical', 'High', 'Medium', 'Low' with emergency override)
    5. priority (1 to 100 fixed formula)
    6. department (deterministic mapping table)
    
    Example Input:
    {
        "complaint": "There is no drinking water in our village"
    }
    
    Example Output:
    {
        "category": "water",
        "confidence": 0.91,
        "needsHumanReview": false,
        "severity": "High",
        "priority": 60,
        "department": "Water Department"
    }
    """
    complaint_text = request.complaint or request.text or ""
    if not complaint_text.strip():
        raise HTTPException(status_code=400, detail="Field 'complaint' or 'text' must not be empty.")

    try:
        # 1. Category and Confidence
        category, confidence, ai_sev = _predict_category_and_confidence(complaint_text)

        # 2. Human Review Flag (confidence < 0.70)
        needs_human_review = check_needs_human_review(confidence)

        # 3. Severity and Priority (with hardcoded emergency keyword override)
        explicit_sev = request.severity or request.model_prediction or ai_sev
        sev_pri = assess_severity_and_priority(
            text=complaint_text,
            duplicate_count=request.duplicate_count or 0,
            recency=request.recency or 0.0,
            model_prediction=explicit_sev
        )
        severity = sev_pri["severity"]
        priority = sev_pri["priority"]

        # 4. Department Recommendation
        department = get_department(category)

        return InternalClassifyResponse(
            category=category,
            confidence=round(confidence, 4),
            needsHumanReview=needs_human_review,
            severity=severity,
            priority=priority,
            department=department
        )
    except Exception as e:
        logger.error(f"Internal classification error: {e}")
        raise HTTPException(status_code=500, detail=f"Classification processing error: {str(e)}")


@app.post("/internal/ai/dedup", response_model=InternalDedupResponse, tags=["Internal AI"])
async def internal_dedup(request: InternalDedupRequest):
    """
    Duplicate complaint detection endpoint via Sentence Transformers + FAISS.
    """
    text_to_check = request.complaint or request.text or ""
    if not text_to_check.strip():
        raise HTTPException(status_code=400, detail="Field 'complaint' or 'text' must not be empty.")

    try:
        threshold = request.threshold if request.threshold is not None else 0.85
        result = check_duplicate(text_to_check, threshold=threshold)
        return InternalDedupResponse(
            isDuplicate=result["isDuplicate"],
            similarity=result["similarity"],
            matchedComplaintId=result.get("matchedComplaintId")
        )
    except Exception as e:
        logger.error(f"Internal dedup error: {e}")
        raise HTTPException(status_code=500, detail=f"Duplicate detection error: {str(e)}")


@app.post("/internal/ai/chatbot/message", response_model=InternalChatbotResponse, tags=["Internal AI"])
async def internal_chatbot_message(request: InternalChatbotRequest):
    """
    Offline multilingual FAQ chatbot endpoint.
    Matches citizen query against 50 curated civic FAQs using FAISS.
    If no match exceeds threshold, returns exact fallback:
    'Want to report this as a problem instead?'
    """
    msg = request.message or request.query or ""
    if not msg.strip():
        raise HTTPException(status_code=400, detail="Field 'message' must not be empty.")

    try:
        bot = get_faq_chatbot()
        res = bot.search_faq(msg)
        return InternalChatbotResponse(
            matched=res["matched"],
            answer=res["answer"]
        )
    except Exception as e:
        logger.error(f"Internal chatbot error: {e}")
        raise HTTPException(status_code=500, detail=f"Chatbot message error: {str(e)}")


@app.post("/internal/ai/feedback", response_model=HumanFeedbackResponse, tags=["Internal AI"])
async def internal_feedback(request: HumanFeedbackRequest):
    """
    Human review feedback endpoint.
    Appends human-verified corrections to dataset/human_feedback.csv.
    """
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
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Internal feedback error: {e}")
        raise HTTPException(status_code=500, detail=f"Feedback submission error: {str(e)}")


# Root status endpoint
@app.get("/main")
def read_root():
    return {"status": "AI Engine is running"}
