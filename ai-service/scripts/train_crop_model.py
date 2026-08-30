"""
Train the crop recommendation model.

Dataset: the standard public "Crop Recommendation Dataset" (2200 rows, 22
crop classes, 100 samples each) with features N, P, K, temperature,
humidity, ph, rainfall -> crop label. Mirrored into this repo at
app/ml/data/crop_recommendation.csv for reproducibility (original source:
Kaggle "Crop Recommendation Dataset" by Atharva Ingle).

Model: RandomForestClassifier (scikit-learn) -- a solid, fast, easily
explainable baseline for small tabular multi-class problems, as suggested
by the project spec. This is a real trained model, not a fabricated one;
the reported accuracy below is whatever the held-out test split actually
measures, printed and saved as-is.

Run: python scripts/train_crop_model.py   (from the ai-service/ directory,
with the venv active)
"""

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "app" / "ml" / "data" / "crop_recommendation.csv"
ARTIFACTS_DIR = ROOT / "app" / "ml" / "artifacts"
FEATURE_COLUMNS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
MODEL_VERSION = "rf-crop-v1"


def main() -> None:
    df = pd.read_csv(DATA_PATH)

    X = df[FEATURE_COLUMNS]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)

    print(f"Test accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred))

    # Per-crop feature statistics (mean/std from the FULL dataset), used at
    # inference time to explain *why* a crop was recommended by comparing
    # the farmer's actual readings to what's typical for that crop --
    # not a fabricated explanation, a real comparison against training data.
    stats = (
        df.groupby("label")[FEATURE_COLUMNS]
        .agg(["mean", "std"])
        .round(2)
    )
    feature_stats = {
        crop: {
            feature: {"mean": stats.loc[crop, (feature, "mean")], "std": stats.loc[crop, (feature, "std")]}
            for feature in FEATURE_COLUMNS
        }
        for crop in stats.index
    }

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, ARTIFACTS_DIR / "crop_model.joblib")

    metadata = {
        "modelVersion": MODEL_VERSION,
        "algorithm": "RandomForestClassifier",
        "featureColumns": FEATURE_COLUMNS,
        "classes": sorted(model.classes_.tolist()),
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "datasetRows": len(df),
        "testAccuracy": round(accuracy, 4),
        "testSetSize": len(X_test),
        "classificationReport": report,
        "featureStats": feature_stats,
    }
    with open(ARTIFACTS_DIR / "crop_model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSaved model to {ARTIFACTS_DIR / 'crop_model.joblib'}")
    print(f"Saved metadata to {ARTIFACTS_DIR / 'crop_model_metadata.json'}")


if __name__ == "__main__":
    main()
