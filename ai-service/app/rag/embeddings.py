"""
Local embeddings via sentence-transformers.

Deliberately NOT using Hugging Face Inference Providers here (unlike
chat_service.py) -- embedding a knowledge base means many calls per
ingestion and one per question, which would burn through the same paid
credit that chat already competes for. Downloading and running an open
embedding model locally is free and standard practice for RAG.

Model: intfloat/multilingual-e5-small. Chosen for cross-lingual retrieval
specifically: farmers ask questions in Hindi/Marathi/Gujarati/English but
ingested knowledge content is typically in English, so the embedding
model needs genuine cross-lingual alignment, not just multilingual
tokenization. E5 models require a "query: " / "passage: " prefix
convention for best retrieval quality -- implemented below, not optional.
"""

EMBEDDING_MODEL_ID = "intfloat/multilingual-e5-small"
EMBEDDING_DIM = 384

_model = None


def _load_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(EMBEDDING_MODEL_ID)
    return _model


def embed_passages(texts: list[str]) -> list[list[float]]:
    model = _load_model()
    prefixed = [f"passage: {t}" for t in texts]
    vectors = model.encode(prefixed, normalize_embeddings=True)
    return vectors.tolist()


def embed_query(text: str) -> list[float]:
    model = _load_model()
    vector = model.encode([f"query: {text}"], normalize_embeddings=True)
    return vector[0].tolist()
