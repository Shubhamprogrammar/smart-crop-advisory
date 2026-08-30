from fastapi import APIRouter

from app.models.disease_risk import DiseaseRiskRequest, DiseaseRiskResponse
from app.services.disease_risk_service import DiseaseRiskInput, predict_disease_risk

router = APIRouter()


@router.post("/ai/disease-risk", response_model=DiseaseRiskResponse)
async def disease_risk(payload: DiseaseRiskRequest):
    result = predict_disease_risk(
        DiseaseRiskInput(
            crop_stage=payload.cropStage,
            temperature=payload.temperature,
            humidity=payload.humidity,
            rainfall=payload.rainfall,
            rain_probability=payload.rainProbability,
            recent_disease_detected=payload.recentDiseaseDetected,
        )
    )

    return DiseaseRiskResponse(
        riskLevel=result.risk_level,
        reason=result.reason,
        preventiveAction=result.preventive_action,
        modelVersion=result.model_version,
    )
