"""
Document ingestion: text extraction + cleaning + chunking.

Per spec §15: Documents -> extract text -> clean text -> chunk -> embedding
-> vector database. This module handles the first three steps.
"""

import io
import re

CHUNK_SIZE_CHARS = 800
CHUNK_OVERLAP_SENTENCES = 2


def extract_text_from_pdf(file_bytes: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(file_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def clean_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


_SENTENCE_SPLIT = re.compile(r"(?<=[.!?।])\s+")


def _split_sentences(text: str) -> list[str]:
    # `।` (Devanagari danda) handles Hindi/Marathi sentence endings alongside
    # standard Latin punctuation; Gujarati commonly reuses Latin punctuation.
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    sentences: list[str] = []
    for para in paragraphs:
        sentences.extend(s.strip() for s in _SENTENCE_SPLIT.split(para) if s.strip())
    return sentences


def chunk_text(text: str, chunk_size_chars: int = CHUNK_SIZE_CHARS) -> list[str]:
    """Greedily groups sentences into chunks up to chunk_size_chars, carrying
    the last few sentences of each chunk into the next for context continuity
    across chunk boundaries."""
    sentences = _split_sentences(text)
    if not sentences:
        return []

    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for sentence in sentences:
        if current_len + len(sentence) > chunk_size_chars and current:
            chunks.append(" ".join(current))
            current = current[-CHUNK_OVERLAP_SENTENCES:]
            current_len = sum(len(s) for s in current)

        current.append(sentence)
        current_len += len(sentence)

    if current:
        chunks.append(" ".join(current))

    return chunks
