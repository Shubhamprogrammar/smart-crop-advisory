"""Soil test report OCR.

This is a heuristic pipeline, not a trained structured-extraction model:
Tesseract OCR turns the image into raw text, then a set of regex patterns
looks for common soil-report labels (N/P/K, pH, organic carbon, moisture)
near a number. Real soil test report layouts vary a lot, so this will not
find every field on every report -- fields it cannot confidently locate are
returned as null rather than guessed. That is the correct behavior per the
project's AI-safety rules (never fabricate a reading), not a bug.
"""

import re
from dataclasses import dataclass
from io import BytesIO

from PIL import Image

OCR_MODEL_VERSION = "tesseract-regex-v1"


class OcrUnavailableError(Exception):
    """Raised when the tesseract binary itself is not installed/reachable."""


@dataclass
class ExtractedSoilValues:
    nitrogen: float | None = None
    phosphorus: float | None = None
    potassium: float | None = None
    ph: float | None = None
    organic_carbon: float | None = None
    moisture: float | None = None

    def found_count(self) -> int:
        return sum(1 for v in vars(self).values() if v is not None)


@dataclass
class SoilOcrResult:
    raw_text: str
    extracted: ExtractedSoilValues
    confidence: str
    model_version: str = OCR_MODEL_VERSION


_NUMBER = r"(-?\d+(?:\.\d+)?)"

_FIELD_PATTERNS: dict[str, list[str]] = {
    "nitrogen": [rf"\bN(?:itrogen)?\b[^0-9\-]{{0,15}}{_NUMBER}"],
    "phosphorus": [rf"\bP(?:hosphorus)?\b[^0-9\-]{{0,15}}{_NUMBER}"],
    "potassium": [rf"\bK(?:alium|\s*\(?Potassium\)?)?\b[^0-9\-]{{0,15}}{_NUMBER}"],
    "ph": [rf"\bpH(?:\s*value)?\b[^0-9\-]{{0,10}}{_NUMBER}"],
    "organic_carbon": [
        rf"\bOrganic\s*Carbon\b[^0-9\-]{{0,15}}{_NUMBER}",
        rf"\bOC\b[^0-9\-]{{0,15}}{_NUMBER}",
    ],
    "moisture": [rf"\bMoisture\b[^0-9\-]{{0,15}}{_NUMBER}"],
}

# Physically plausible ranges. A number that lands outside its field's range
# is almost certainly an OCR misread (e.g. a lost decimal point), so it's
# discarded rather than reported as a confident-looking wrong value.
_PLAUSIBLE_RANGE: dict[str, tuple[float, float]] = {
    "nitrogen": (0, 2000),  # kg/ha
    "phosphorus": (0, 500),  # kg/ha
    "potassium": (0, 1000),  # kg/ha
    "ph": (0, 14),
    "organic_carbon": (0, 10),  # %
    "moisture": (0, 100),  # %
}


def _extract_field(text: str, field_name: str) -> float | None:
    low, high = _PLAUSIBLE_RANGE[field_name]
    for pattern in _FIELD_PATTERNS[field_name]:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                value = float(match.group(1))
            except ValueError:
                continue
            if low <= value <= high:
                return value
    return None


def parse_soil_values(raw_text: str) -> ExtractedSoilValues:
    return ExtractedSoilValues(
        nitrogen=_extract_field(raw_text, "nitrogen"),
        phosphorus=_extract_field(raw_text, "phosphorus"),
        potassium=_extract_field(raw_text, "potassium"),
        ph=_extract_field(raw_text, "ph"),
        organic_carbon=_extract_field(raw_text, "organic_carbon"),
        moisture=_extract_field(raw_text, "moisture"),
    )


def run_ocr(image_bytes: bytes) -> SoilOcrResult:
    try:
        import pytesseract
    except ImportError as exc:  # pragma: no cover - defensive
        raise OcrUnavailableError("pytesseract is not installed") from exc

    try:
        image = Image.open(BytesIO(image_bytes))
        raw_text = pytesseract.image_to_string(image)
    except pytesseract.TesseractNotFoundError as exc:
        raise OcrUnavailableError("tesseract binary is not installed on this host") from exc

    extracted = parse_soil_values(raw_text)
    found = extracted.found_count()
    if found >= 5:
        confidence = "high"
    elif found >= 3:
        confidence = "medium"
    elif found >= 1:
        confidence = "low"
    else:
        confidence = "none"

    return SoilOcrResult(raw_text=raw_text.strip(), extracted=extracted, confidence=confidence)
