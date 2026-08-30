from pydantic import BaseModel


class ChatHistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    language: str = "en"
    context: str = ""
    history: list[ChatHistoryMessage] = []


class ChatResponse(BaseModel):
    answer: str
    modelVersion: str
