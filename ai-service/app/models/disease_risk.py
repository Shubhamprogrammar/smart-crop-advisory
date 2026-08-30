from pydantic import BaseModel, Field


class DiseaseRiskRequest(BaseModel):
    cropStage: str
    temperature: float = Field(ge=-10, le=60)
    humidity: float = Field(ge=0, le=100)
    rainfall: float = Field(ge=0, le=5000)
    rainProbability: float = Field(ge=0, le=100)
    recentDiseaseDetected: bool = False


class DiseaseRiskResponse(BaseModel):
    riskLevel: str
    reason: str
    preventiveAction: str
    modelVersion: str
