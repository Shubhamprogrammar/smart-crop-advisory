from pydantic import BaseModel


class ChatHistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    language: str = "en"
    context: str = ""
    history: list[ChatHistoryMessage] = []


class ChatSourceSchema(BaseModel):
    documentId: str
    title: str
    chunkText: str
    score: float


class ChatResponse(BaseModel):
    answer: str
    modelVersion: str
    sources: list[ChatSourceSchema] = []
