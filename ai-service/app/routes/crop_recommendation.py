from fastapi import APIRouter, HTTPException

from app.models.crop import (
    CropPredictionSchema,
    CropRecommendationRequest,
    CropRecommendationResponse,
)
from app.services.crop_recommendation_service import (
    CropRecommendationInput,
    ModelUnavailableError,
    get_model_metadata,
    predict_crops,
)

router = APIRouter()


@router.post("/ai/crop-recommendation", response_model=CropRecommendationResponse)
async def crop_recommendation(payload: CropRecommendationRequest):
    try:
        metadata = get_model_metadata()
        predictions = predict_crops(
            CropRecommendationInput(
                nitrogen=payload.nitrogen,
                phosphorus=payload.phosphorus,
                potassium=payload.potassium,
                temperature=payload.temperature,
                humidity=payload.humidity,
                ph=payload.ph,
                rainfall=payload.rainfall,
            )
        )
    except ModelUnavailableError:
        raise HTTPException(
            status_code=503,
            detail="Crop recommendation is temporarily unavailable.",
        )

    return CropRecommendationResponse(
        recommendations=[
            CropPredictionSchema(
                crop=p.crop,
                suitabilityScore=p.suitability_score,
                explanation=p.explanation,
                benefits=p.benefits,
                risks=p.risks,
            )
            for p in predictions
        ],
        modelVersion=metadata["modelVersion"],
    )
