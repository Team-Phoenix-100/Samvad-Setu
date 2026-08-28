from fastapi import APIRouter, HTTPException

from .Schemes import ChatRequest, ChatResponse
from .Service import AIService


router = APIRouter(
    prefix="/chat",
    tags=["Chatbot"]
)

ai_service = AIService()


@router.post("/",response_model=ChatResponse)
async def chat(request: ChatRequest):

    try:

        answer = ai_service.generate_response(
            request.message
        )

        return ChatResponse(
            status="success",
            response=answer
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Chatbot error: {str(e)}"
        )