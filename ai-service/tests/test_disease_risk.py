"""Unit + sample-prediction tests for the disease-risk rules engine.

This service is pure Python (dataclasses, no external ML deps), so it can
be tested in isolation without torch/transformers/sklearn.
"""

from app.services.disease_risk_service import (
    DiseaseRiskInput,
    predict_disease_risk,
    FUNGAL_FAVORABLE_TEMP_RANGE,
    HIGH_RISK_STAGES,
)


def input_for(**overrides):
    base = dict(
        crop_stage="vegetative",
        temperature=26.0,
        humidity=80.0,
        rainfall=0.0,
        rain_probability=60.0,
        recent_disease_detected=False,
    )
    base.update(overrides)
    return DiseaseRiskInput(**base)


class TestDiseaseRiskUnit:
    def test_returns_low_for_benign_conditions(self):
        result = predict_disease_risk(input_for(crop_stage="sowing", humidity=30, temperature=35, rainfall=0, rain_probability=10))
        assert result.risk_level == "low"
        assert result.score == 0
        assert result.model_version

    def test_known_stage_is_high_risk(self):
        for stage in HIGH_RISK_STAGES:
            result = predict_disease_risk(input_for(crop_stage=stage))
            assert result.risk_level in {"medium", "high"}
            assert stage in result.reason

    def test_very_high_humidity_raises_score(self):
        low = predict_disease_risk(input_for(humidity=50, crop_stage="sowing", rain_probability=0, temperature=40))
        high = predict_disease_risk(input_for(humidity=95, crop_stage="sowing", rain_probability=0, temperature=40))
        assert high.score > low.score

    def test_recent_disease_detection_raises_risk(self):
        clean = predict_disease_risk(input_for(crop_stage="sowing", humidity=40, temperature=40, rain_probability=0))
        prior = predict_disease_risk(
            input_for(crop_stage="sowing", humidity=40, temperature=40, rain_probability=0, recent_disease_detected=True)
        )
        assert prior.score == clean.score + 2

    def test_high_risk_always_recommends_expert_consultation(self):
        result = predict_disease_risk(
            input_for(humidity=95, temperature=26, rainfall=10, rain_probability=90, recent_disease_detected=True)
        )
        assert result.risk_level == "high"
        assert "expert" in result.preventive_action.lower()


class TestDiseaseRiskSamplePredictions:
    def test_typical_monsoon_condition_is_high_risk(self):
        # Hot, humid, wet, flowering tomato during monsoon -> high
        result = predict_disease_risk(
            input_for(crop_stage="flowering", temperature=28, humidity=92, rainfall=20, rain_probability=80)
        )
        assert result.risk_level == "high"

    def test_dry_harvest_condition_is_low_risk(self):
        result = predict_disease_risk(
            input_for(crop_stage="harvest", temperature=18, humidity=35, rainfall=0, rain_probability=5)
        )
        assert result.risk_level == "low"


class TestDiseaseRiskInvalidInput:
    def test_zero_rain_probability_is_accepted(self):
        result = predict_disease_risk(input_for(rain_probability=0, humidity=30, temperature=40))
        assert isinstance(result.risk_level, str)

    def test_extreme_temperature_is_handled(self):
        # Temperatures outside the fungal-friendly band contribute 0 to score
        result = predict_disease_risk(input_for(temperature=50, humidity=40, rain_probability=0))
        assert isinstance(result.risk_level, str)
