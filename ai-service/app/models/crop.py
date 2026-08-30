from pydantic import BaseModel, Field


class CropRecommendationRequest(BaseModel):
    nitrogen: float = Field(ge=0, le=300, description="N, kg/ha")
    phosphorus: float = Field(ge=0, le=300, description="P, kg/ha")
    potassium: float = Field(ge=0, le=300, description="K, kg/ha")
    temperature: float = Field(ge=-10, le=60, description="Celsius")
    humidity: float = Field(ge=0, le=100, description="%")
    ph: float = Field(ge=0, le=14)
    rainfall: float = Field(ge=0, le=5000, description="mm")


class CropPredictionSchema(BaseModel):
    crop: str
    suitabilityScore: float
    explanation: str
    benefits: list[str]
    risks: list[str]


class CropRecommendationResponse(BaseModel):
    recommendations: list[CropPredictionSchema]
    modelVersion: str
    source: str = "ml_model"
