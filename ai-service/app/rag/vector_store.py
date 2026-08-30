"""
Qdrant vector store.

Per spec §L: "Prefer MongoDB Vector Search if practical. If MongoDB
Vector Search is not available in the selected environment, use Qdrant."
MongoDB Atlas Vector Search requires an Atlas-managed cluster (or a
self-hosted `mongot` search process); this project's development/test
environment runs a bare local `mongod` with neither, so Atlas Vector
Search is genuinely unavailable here -- Qdrant is the spec's own
documented fallback for exactly this situation, not a deviation from it.
No additional database class is introduced: Qdrant is the vector index
only, MongoDB remains the source of truth for document metadata
(KnowledgeDocument, on the Node side).
"""

from dataclasses import dataclass

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from app.config import get_settings
from app.rag.embeddings import EMBEDDING_DIM

COLLECTION_NAME = "knowledge_chunks"

_client: QdrantClient | None = None


class VectorStoreUnavailableError(Exception):
    pass


def _get_client() -> QdrantClient:
    global _client
    if _client is None:
        settings = get_settings()
        if not settings.qdrant_url:
            raise VectorStoreUnavailableError("QDRANT_URL is not configured")
        _client = QdrantClient(url=settings.qdrant_url)
        _ensure_collection(_client)
    return _client


def _ensure_collection(client: QdrantClient) -> None:
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(size=EMBEDDING_DIM, distance=qmodels.Distance.COSINE),
        )


@dataclass
class ChunkRecord:
    document_id: str
    title: str
    category: str
    language: str
    chunk_index: int
    chunk_text: str


def upsert_chunks(records: list[ChunkRecord], vectors: list[list[float]]) -> None:
    client = _get_client()
    points = [
        qmodels.PointStruct(
            id=f"{r.document_id}-{r.chunk_index}".__hash__() & ((1 << 63) - 1),
            vector=vector,
            payload={
                "documentId": r.document_id,
                "title": r.title,
                "category": r.category,
                "language": r.language,
                "chunkIndex": r.chunk_index,
                "chunkText": r.chunk_text,
            },
        )
        for r, vector in zip(records, vectors)
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points)


@dataclass
class SearchResult:
    document_id: str
    title: str
    chunk_text: str
    score: float


def search(query_vector: list[float], top_k: int = 4) -> list[SearchResult]:
    client = _get_client()
    hits = client.query_points(
        collection_name=COLLECTION_NAME, query=query_vector, limit=top_k
    ).points
    return [
        SearchResult(
            document_id=hit.payload["documentId"],
            title=hit.payload["title"],
            chunk_text=hit.payload["chunkText"],
            score=hit.score,
        )
        for hit in hits
    ]


def delete_document(document_id: str) -> None:
    client = _get_client()
    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=qmodels.FilterSelector(
            filter=qmodels.Filter(
                must=[qmodels.FieldCondition(key="documentId", match=qmodels.MatchValue(value=document_id))]
            )
        ),
    )
