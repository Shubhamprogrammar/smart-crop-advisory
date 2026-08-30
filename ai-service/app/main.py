from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import crop_recommendation, disease_detection, disease_risk, health, soil_ocr

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

# Additional AI capability routers are included here as each phase is built.
