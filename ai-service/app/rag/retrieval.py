"""
RAG retrieval and ingestion orchestration.

Per spec §15:
- Ingestion: document -> extract -> clean -> chunk -> embedding -> vector DB
- Retrieval: question -> embedding -> vector search -> top K chunks
"""

from dataclasses import dataclass

from app.rag.embeddings import embed_passages, embed_query
from app.rag.ingestion import chunk_text, clean_text
from app.rag.vector_store import ChunkRecord, SearchResult, delete_document, search, upsert_chunks

MIN_RELEVANCE_SCORE = 0.75


def ingest_document(document_id: str, title: str, category: str, language: str, raw_text: str) -> int:
    cleaned = clean_text(raw_text)
    chunks = chunk_text(cleaned)
    if not chunks:
        return 0

    vectors = embed_passages(chunks)
    records = [
        ChunkRecord(
            document_id=document_id,
            title=title,
            category=category,
            language=language,
            chunk_index=i,
            chunk_text=chunk,
        )
        for i, chunk in enumerate(chunks)
    ]
    upsert_chunks(records, vectors)
    return len(chunks)


def reingest_document(document_id: str, title: str, category: str, language: str, raw_text: str) -> int:
    delete_document(document_id)
    return ingest_document(document_id, title, category, language, raw_text)


@dataclass
class RetrievedChunk:
    document_id: str
    title: str
    chunk_text: str
    score: float


def retrieve_context(question: str, top_k: int = 4) -> list[RetrievedChunk]:
    query_vector = embed_query(question)
    results: list[SearchResult] = search(query_vector, top_k=top_k)

    # Below this similarity, a chunk is more likely noise than genuinely
    # relevant -- per spec ("do not invent agricultural facts... clearly
    # state uncertainty"), it's safer to retrieve nothing than to hand the
    # LLM a barely-related chunk it might treat as authoritative.
    relevant = [r for r in results if r.score >= MIN_RELEVANCE_SCORE]

    return [
        RetrievedChunk(document_id=r.document_id, title=r.title, chunk_text=r.chunk_text, score=r.score)
        for r in relevant
    ]
