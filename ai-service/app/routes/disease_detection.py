from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.disease import DiseaseDetectionResponse
from app.services.disease_detection_service import (
    MODEL_VERSION,
    InvalidImageError,
    ModelUnavailableError,
    detect_disease,
)

router = APIRouter()

MAX_IMAGE_BYTES = 8 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/ai/disease-detection", response_model=DiseaseDetectionResponse)
async def disease_detection(image: UploadFile = File(...)):
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=422, detail="Unsupported image type")

    body = await image.read()
    if len(body) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=422, detail="Image exceeds 8MB limit")

    try:
        result = detect_disease(body)
    except InvalidImageError:
        raise HTTPException(status_code=422, detail="Uploaded file is not a valid image")
    except ModelUnavailableError:
        raise HTTPException(
            status_code=503,
            detail="Disease detection is temporarily unavailable.",
        )

    return DiseaseDetectionResponse(
        status=result.status,
        detectedLabel=result.detectedLabel,
        confidence=result.confidence,
        cropType=result.cropType,
        diseaseName=result.diseaseName,
        isHealthy=result.isHealthy,
        symptoms=result.symptoms,
        possibleCauses=result.possibleCauses,
        prevention=result.prevention,
        treatment=result.treatment,
        recommendedAction=result.recommendedAction,
        modelVersion=MODEL_VERSION,
    )
