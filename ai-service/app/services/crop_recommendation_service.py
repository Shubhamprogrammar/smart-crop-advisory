import json
from dataclasses import dataclass
from pathlib import Path

import joblib
import pandas as pd

from app.ml.crop_knowledge import get_crop_knowledge

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent / "ml" / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "crop_model.joblib"
METADATA_PATH = ARTIFACTS_DIR / "crop_model_metadata.json"

FEATURE_LABELS = {
    "N": "Nitrogen",
    "P": "Phosphorus",
    "K": "Potassium",
    "temperature": "Temperature",
    "humidity": "Humidity",
    "ph": "pH",
    "rainfall": "Rainfall",
}


class ModelUnavailableError(Exception):
    """Raised when the trained model artifact can't be loaded."""


@dataclass
class CropRecommendationInput:
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


@dataclass
class CropPrediction:
    crop: str
    suitability_score: float
    explanation: str
    benefits: list[str]
    risks: list[str]


_model = None
_metadata: dict | None = None


def _load() -> tuple[object, dict]:
    global _model, _metadata
    if _model is None or _metadata is None:
        if not MODEL_PATH.exists() or not METADATA_PATH.exists():
            raise ModelUnavailableError("Crop recommendation model artifact not found")
        try:
            _model = joblib.load(MODEL_PATH)
            with open(METADATA_PATH) as f:
                _metadata = json.load(f)
        except Exception as exc:  # pragma: no cover - defensive
            raise ModelUnavailableError(f"Failed to load crop recommendation model: {exc}") from exc
    return _model, _metadata


def get_model_metadata() -> dict:
    _, metadata = _load()
    return metadata


def _build_explanation(crop: str, input_values: dict[str, float], feature_stats: dict) -> str:
    typical: list[str] = []
    atypical: list[str] = []

    stats = feature_stats.get(crop, {})
    for feature, value in input_values.items():
        feature_stat = stats.get(feature)
        if not feature_stat or feature_stat.get("std") in (None, 0):
            continue
        mean = feature_stat["mean"]
        std = feature_stat["std"]
        label = FEATURE_LABELS[feature]
        if abs(value - mean) <= std:
            typical.append(label)
        elif abs(value - mean) > 2 * std:
            atypical.append(label)

    parts = []
    if typical:
        parts.append(
            f"{', '.join(typical)} {'are' if len(typical) > 1 else 'is'} close to what {crop} typically needs"
        )
    if atypical:
        parts.append(
            f"{', '.join(atypical)} {'are' if len(atypical) > 1 else 'is'} notably different from {crop}'s typical range, worth monitoring"
        )

    if not parts:
        return f"Your inputs are within a plausible range for {crop} based on historical data."

    sentences = [part[0].upper() + part[1:] for part in parts]
    return ". ".join(sentences) + "."


def predict_crops(input_data: CropRecommendationInput, top_k: int = 3) -> list[CropPrediction]:
    model, metadata = _load()

    input_values = {
        "N": input_data.nitrogen,
        "P": input_data.phosphorus,
        "K": input_data.potassium,
        "temperature": input_data.temperature,
        "humidity": input_data.humidity,
        "ph": input_data.ph,
        "rainfall": input_data.rainfall,
    }

    features_df = pd.DataFrame([input_values], columns=metadata["featureColumns"])
    probabilities = model.predict_proba(features_df)[0]
    classes = model.classes_

    ranked = sorted(zip(classes, probabilities), key=lambda pair: pair[1], reverse=True)[:top_k]

    results: list[CropPrediction] = []
    for crop, probability in ranked:
        knowledge = get_crop_knowledge(crop)
        results.append(
            CropPrediction(
                crop=crop,
                suitability_score=round(float(probability), 4),
                explanation=_build_explanation(crop, input_values, metadata["featureStats"]),
                benefits=knowledge["benefits"],
                risks=knowledge["risks"],
            )
        )

    return results
