"""API-level tests for the /ai/disease-risk endpoint.

Rather than importing app.main (which pulls in torch/transformers/sklearn
via the crop and disease-detection routers), we build a minimal FastAPI
app from just the disease-risk router so this suite runs with only the
light dependencies (fastapi + pydantic + httpx).
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routes.disease_risk import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)


def test_valid_disease_risk_prediction():
    res = client.post(
        "/ai/disease-risk",
        json={
            "cropStage": "flowering",
            "temperature": 28,
            "humidity": 92,
            "rainfall": 10,
            "rainProbability": 80,
            "recentDiseaseDetected": True,
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["riskLevel"] in {"low", "medium", "high"}
    assert body["reason"]
    assert body["preventiveAction"]
    assert body["modelVersion"]


def test_low_risk_prediction_is_labeled():
    res = client.post(
        "/ai/disease-risk",
        json={
            "cropStage": "harvest",
            "temperature": 18,
            "humidity": 30,
            "rainfall": 0,
            "rainProbability": 5,
        },
    )
    assert res.status_code == 200
    assert res.json()["riskLevel"] == "low"


class TestDiseaseRiskInvalidInput:
    def test_humidity_out_of_range(self):
        res = client.post(
            "/ai/disease-risk",
            json={
                "cropStage": "vegetative",
                "temperature": 26,
                "humidity": 150,  # > 100
                "rainfall": 0,
                "rainProbability": 50,
            },
        )
        assert res.status_code == 422

    def test_temperature_out_of_range(self):
        res = client.post(
            "/ai/disease-risk",
            json={
                "cropStage": "vegetative",
                "temperature": 200,  # > 60
                "humidity": 50,
                "rainfall": 0,
                "rainProbability": 50,
            },
        )
        assert res.status_code == 422

    def test_missing_required_field(self):
        res = client.post(
            "/ai/disease-risk",
            json={
                "temperature": 26,
                "humidity": 50,
                "rainfall": 0,
                "rainProbability": 50,
            },
        )
        assert res.status_code == 422

    def test_rain_probability_out_of_range(self):
        res = client.post(
            "/ai/disease-risk",
            json={
                "cropStage": "vegetative",
                "temperature": 26,
                "humidity": 50,
                "rainfall": 0,
                "rainProbability": 120,
            },
        )
        assert res.status_code == 422
