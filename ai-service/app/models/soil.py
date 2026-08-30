from pydantic import BaseModel


class ExtractedSoilValuesSchema(BaseModel):
    nitrogen: float | None = None
    phosphorus: float | None = None
    potassium: float | None = None
    ph: float | None = None
    organicCarbon: float | None = None
    moisture: float | None = None


class SoilOcrResponse(BaseModel):
    rawText: str
    extracted: ExtractedSoilValuesSchema
    confidence: str
    modelVersion: str
