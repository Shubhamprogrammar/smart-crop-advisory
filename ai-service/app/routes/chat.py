from fastapi import APIRouter, HTTPException

from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatMessage, ChatUnavailableError, get_reply

router = APIRouter()


@router.post("/ai/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    if not payload.question.strip():
        raise HTTPException(status_code=422, detail="question must not be empty")

    try:
        reply = get_reply(
            question=payload.question,
            language=payload.language,
            context=payload.context,
            history=[ChatMessage(role=m.role, content=m.content) for m in payload.history],
        )
    except ChatUnavailableError:
        raise HTTPException(
            status_code=503,
            detail="The AI assistant is temporarily unavailable. Please try again later.",
        )

    return ChatResponse(answer=reply.answer, modelVersion=reply.modelVersion)
