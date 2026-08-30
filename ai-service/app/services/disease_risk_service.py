"""
Disease risk prediction: rules + data, not an ML classifier.

This is deliberately deterministic and inspectable rather than a trained
model -- the spec calls for exactly this ("Use Rules + ML + Data + LLM";
disease risk is explicitly a rules/data problem, distinct from the image
classifier in disease_detection_service.py). It combines:

- Weather (humidity/temperature/rainfall/rain probability) against the
  general conditions that favor common fungal/bacterial crop diseases
  (warm-to-mild temperatures, high humidity, recent or expected wetness)
- Crop growth stage (denser canopy / more susceptible tissue during
  vegetative-flowering-fruiting than at sowing/germination/harvest)
- Real recent disease history for this crop cycle (an actual prior
  detection on this cycle raises risk of recurrence/spread) -- this is
  the "historical information" input the spec calls for, sourced from
  this app's own DiseaseDetection records rather than a fabricated
  external historical dataset

The score is a simple weighted sum with a documented threshold, not a
black box -- every contributing factor is named in the `reason` string.
"""

from dataclasses import dataclass

RISK_MODEL_VERSION = "disease-risk-rules-v1"

FUNGAL_FAVORABLE_TEMP_RANGE = (15, 32)  # deg C, broad range for common fungal pathogens
HIGH_RISK_STAGES = {"vegetative", "flowering", "fruiting"}


@dataclass
class DiseaseRiskInput:
    crop_stage: str
    temperature: float
    humidity: float
    rainfall: float
    rain_probability: float
    recent_disease_detected: bool


@dataclass
class DiseaseRiskResult:
    risk_level: str  # "low" | "medium" | "high"
    score: int
    reason: str
    preventive_action: str
    model_version: str = RISK_MODEL_VERSION


def _score_and_reasons(input_data: DiseaseRiskInput) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []

    if input_data.humidity >= 85:
        score += 3
        reasons.append(f"very high humidity ({input_data.humidity}%)")
    elif input_data.humidity >= 70:
        score += 2
        reasons.append(f"high humidity ({input_data.humidity}%)")
    elif input_data.humidity >= 55:
        score += 1
        reasons.append(f"moderate humidity ({input_data.humidity}%)")

    temp_low, temp_high = FUNGAL_FAVORABLE_TEMP_RANGE
    if temp_low <= input_data.temperature <= temp_high:
        score += 2
        reasons.append(f"temperature ({input_data.temperature}°C) is in the range common fungal diseases favor")

    is_wet = input_data.rainfall > 0 or input_data.rain_probability >= 50
    if is_wet:
        score += 2
        reasons.append("recent or expected rainfall")

    if input_data.crop_stage in HIGH_RISK_STAGES:
        score += 1
        reasons.append(f"crop is in the {input_data.crop_stage} stage (denser canopy, more susceptible tissue)")

    if input_data.recent_disease_detected:
        score += 2
        reasons.append("a disease was already detected on this crop recently")

    return score, reasons


def predict_disease_risk(input_data: DiseaseRiskInput) -> DiseaseRiskResult:
    score, reasons = _score_and_reasons(input_data)

    if score >= 6:
        risk_level = "high"
    elif score >= 3:
        risk_level = "medium"
    else:
        risk_level = "low"

    if reasons:
        reason = "Elevated disease risk due to: " + "; ".join(reasons) + "." if risk_level != "low" else (
            "Some conditions favor disease (" + "; ".join(reasons) + "), but overall risk remains low."
        )
    else:
        reason = "Current weather and crop stage are not particularly favorable to common crop diseases."

    if risk_level == "high":
        preventive_action = (
            "Increase monitoring frequency. Avoid overhead irrigation and avoid working in wet fields. "
            "Improve airflow around plants where possible. Consult a local agriculture expert if symptoms appear."
        )
    elif risk_level == "medium":
        preventive_action = (
            "Monitor the crop regularly for early symptoms (spots, wilting, discoloration). "
            "Avoid unnecessary overhead irrigation during humid periods."
        )
    else:
        preventive_action = "No special action needed beyond routine monitoring."

    return DiseaseRiskResult(
        risk_level=risk_level,
        score=score,
        reason=reason,
        preventive_action=preventive_action,
    )
