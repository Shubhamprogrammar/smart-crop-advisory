from pydantic import BaseModel


class DiseaseDetectionResponse(BaseModel):
    status: str
    detectedLabel: str
    confidence: float
    cropType: str | None = None
    diseaseName: str | None = None
    isHealthy: bool | None = None
    symptoms: list[str] = []
    possibleCauses: list[str] = []
    prevention: list[str] = []
    treatment: list[str] = []
    recommendedAction: str
    modelVersion: str
