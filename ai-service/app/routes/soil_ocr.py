from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.soil import ExtractedSoilValuesSchema, SoilOcrResponse
from app.services.soil_ocr_service import OcrUnavailableError, run_ocr

router = APIRouter()

MAX_IMAGE_BYTES = 8 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/ai/soil-ocr", response_model=SoilOcrResponse)
async def soil_ocr(image: UploadFile = File(...)):
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=422, detail="Unsupported image type")

    body = await image.read()
    if len(body) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=422, detail="Image exceeds 8MB limit")

    try:
        result = run_ocr(body)
    except OcrUnavailableError:
        raise HTTPException(
            status_code=503,
            detail="Soil report OCR is temporarily unavailable. Please enter values manually.",
        )

    return SoilOcrResponse(
        rawText=result.raw_text,
        extracted=ExtractedSoilValuesSchema(
            nitrogen=result.extracted.nitrogen,
            phosphorus=result.extracted.phosphorus,
            potassium=result.extracted.potassium,
            ph=result.extracted.ph,
            organicCarbon=result.extracted.organic_carbon,
            moisture=result.extracted.moisture,
        ),
        confidence=result.confidence,
        modelVersion=result.model_version,
    )
