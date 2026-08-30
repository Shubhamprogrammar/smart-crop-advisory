"""
Disease detection inference.

Model: linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification
(public Hugging Face model, MobileNetV2 fine-tuned on the PlantVillage
"New Plant Diseases Dataset", 38 classes across 14 crops). Loaded locally
via `transformers` rather than the hosted HF Inference API, since this
project has no HF_API_TOKEN configured.

This app only *acts on* results for tomato, potato, and maize — the 3 of
the spec's 6 target crops this specific model actually supports (see
DISEASE_KNOWLEDGE / SUPPORTED_DISEASE_CROPS). A prediction landing on one
of the model's other 25 classes (apple, grape, etc.) is reported as an
unsupported crop, not silently mapped to the wrong knowledge. A
low-confidence prediction returns the spec's exact required message
rather than a guess.

We deliberately do NOT report a "severity" score: this classifier
identifies *which* disease is present, not how much of the plant is
affected — fabricating a severity grade from classification confidence
would conflate two different things. Severity is left null.
"""

import io
from dataclasses import dataclass, field

from PIL import Image, UnidentifiedImageError

from app.ml.disease_knowledge import get_disease_knowledge

MODEL_ID = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
MODEL_VERSION = "mobilenet_v2-plantvillage-v1"
CONFIDENCE_THRESHOLD = 0.5

LOW_CONFIDENCE_MESSAGE = (
    "Unable to confidently identify the disease. Please upload a clearer image "
    "or consult an agriculture expert."
)


class ModelUnavailableError(Exception):
    """Raised when the disease detection model can't be loaded/run."""


class InvalidImageError(Exception):
    """Raised when the uploaded bytes aren't a readable image."""


@dataclass
class DiseaseDetectionResult:
    status: str  # "identified" | "unsupported_crop" | "low_confidence"
    detectedLabel: str
    confidence: float
    cropType: str | None = None
    diseaseName: str | None = None
    isHealthy: bool | None = None
    symptoms: list[str] = field(default_factory=list)
    possibleCauses: list[str] = field(default_factory=list)
    prevention: list[str] = field(default_factory=list)
    treatment: list[str] = field(default_factory=list)
    recommendedAction: str = ""


_processor = None
_model = None


def _load():
    global _processor, _model
    if _processor is None or _model is None:
        try:
            from transformers import AutoImageProcessor, AutoModelForImageClassification

            _processor = AutoImageProcessor.from_pretrained(MODEL_ID)
            _model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
            _model.eval()
        except Exception as exc:
            _processor = None
            _model = None
            raise ModelUnavailableError(f"Failed to load disease detection model: {exc}") from exc
    return _processor, _model


def _classify(image_bytes: bytes) -> tuple[str, float]:
    import torch

    processor, model = _load()

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise InvalidImageError("Uploaded file is not a valid image") from exc

    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)

    probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
    top_prob, top_idx = torch.max(probabilities, dim=0)
    label = model.config.id2label[top_idx.item()]
    return label, float(top_prob.item())


def detect_disease(image_bytes: bytes) -> DiseaseDetectionResult:
    label, confidence = _classify(image_bytes)

    if confidence < CONFIDENCE_THRESHOLD:
        return DiseaseDetectionResult(
            status="low_confidence",
            detectedLabel=label,
            confidence=round(confidence, 4),
            recommendedAction=LOW_CONFIDENCE_MESSAGE,
        )

    knowledge = get_disease_knowledge(label)

    if knowledge is None:
        return DiseaseDetectionResult(
            status="unsupported_crop",
            detectedLabel=label,
            confidence=round(confidence, 4),
            recommendedAction=(
                f"This image appears to show '{label}', which isn't yet supported by our "
                "disease detection system. We currently support tomato, potato, and maize/corn."
            ),
        )

    is_healthy = knowledge["isHealthy"]
    return DiseaseDetectionResult(
        status="identified",
        detectedLabel=label,
        confidence=round(confidence, 4),
        cropType=knowledge["cropType"],
        diseaseName=knowledge["diseaseName"],
        isHealthy=is_healthy,
        symptoms=knowledge["symptoms"],
        possibleCauses=knowledge["possibleCauses"],
        prevention=knowledge["prevention"],
        treatment=knowledge["treatment"],
        recommendedAction=(
            "No action needed — continue regular monitoring."
            if is_healthy
            else "Review the prevention/treatment guidance below. For severe or spreading symptoms, consult a local agriculture expert."
        ),
    )
