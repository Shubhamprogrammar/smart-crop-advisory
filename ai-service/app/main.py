import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import chat, crop_recommendation, disease_detection, disease_risk, embeddings, health, soil_ocr

# uvicorn reconfigures the root logger at startup, which silently drops
# Python's default "last resort" stderr handler our app loggers rely on --
# without this, logger.warning() calls in services (e.g. chat_service.py's
# LLM-failure logging) never appear anywhere. Configuring our own app
# logger explicitly makes them show up regardless of uvicorn's setup.
logging.getLogger("app").setLevel(logging.INFO)
if not logging.getLogger("app").handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    logging.getLogger("app").addHandler(_handler)

settings = get_settings()

app = FastAPI(
    title="Smart Crop Advisory — AI Service",
    description="FastAPI service for crop recommendation, disease detection, disease-risk prediction, OCR, chat, and RAG embeddings.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(soil_ocr.router)
app.include_router(crop_recommendation.router)
app.include_router(disease_detection.router)
app.include_router(disease_risk.router)
app.include_router(chat.router)
app.include_router(embeddings.router)
