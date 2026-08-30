from pydantic import BaseModel


class IngestRequest(BaseModel):
    documentId: str
    title: str
    category: str
    language: str = "en"
    text: str


class IngestResponse(BaseModel):
    chunkCount: int


class RagSourceSchema(BaseModel):
    documentId: str
    title: str
    chunkText: str
    score: float
