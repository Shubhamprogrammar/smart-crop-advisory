from fastapi import APIRouter, HTTPException

from app.models.rag import IngestRequest, IngestResponse
from app.rag.retrieval import reingest_document
from app.rag.vector_store import VectorStoreUnavailableError, delete_document

router = APIRouter()


@router.post("/ai/embeddings", response_model=IngestResponse)
async def ingest(payload: IngestRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=422, detail="text must not be empty")

    try:
        chunk_count = reingest_document(
            document_id=payload.documentId,
            title=payload.title,
            category=payload.category,
            language=payload.language,
            raw_text=payload.text,
        )
    except VectorStoreUnavailableError:
        raise HTTPException(status_code=503, detail="Knowledge base storage is temporarily unavailable.")

    return IngestResponse(chunkCount=chunk_count)


@router.delete("/ai/embeddings/{document_id}")
async def delete(document_id: str):
    try:
        delete_document(document_id)
    except VectorStoreUnavailableError:
        raise HTTPException(status_code=503, detail="Knowledge base storage is temporarily unavailable.")

    return {"success": True}
