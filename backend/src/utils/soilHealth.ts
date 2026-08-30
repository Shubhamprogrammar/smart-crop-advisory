/**
 * Deterministic, rule-based soil health scoring.
 *
 * Thresholds follow the general Low/Medium/High bands used by India's Soil
 * Health Card scheme (N/P/K in kg/ha, organic carbon in %). This is a
 * simplified educational approximation, not a certified agronomic tool --
 * the interpretation text says so explicitly rather than overclaiming
 * precision, and the score only averages over parameters that were actually
 * provided (never fabricates a reading for a missing field).
 */

export interface SoilInput {
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  ph?: number;
  organicCarbon?: number;
  moisture?: number;
}

export interface SoilHealthResult {
  healthScore: number | undefined;
  interpretation: string;
  fertilizerRecommendation: string;
}

type Level = "low" | "medium" | "high" | "optimal";

function scoreFromLevel(level: Level): number {
  switch (level) {
    case "low":
      return 35;
    case "medium":
      return 70;
    case "high":
      return 90;
    case "optimal":
      return 100;
  }
}

function levelForNitrogen(n: number): Level {
  if (n < 280) return "low";
  if (n <= 560) return "medium";
  return "high";
}

function levelForPhosphorus(p: number): Level {
  if (p < 10) return "low";
  if (p <= 24.6) return "medium";
  return "high";
}

function levelForPotassium(k: number): Level {
  if (k < 108) return "low";
  if (k <= 280) return "medium";
  return "high";
}

function levelForPh(ph: number): Level {
  if (ph >= 6.5 && ph <= 7.5) return "optimal";
  if ((ph >= 5.5 && ph < 6.5) || (ph > 7.5 && ph <= 8.5)) return "medium";
  return "low";
}

function levelForOrganicCarbon(oc: number): Level {
  if (oc < 0.5) return "low";
  if (oc <= 0.75) return "medium";
  return "high";
}

export function computeSoilHealth(input: SoilInput): SoilHealthResult {
  const notes: string[] = [];
  const fertilizerNotes: string[] = [];
  const scores: number[] = [];

  if (input.nitrogen !== undefined) {
    const level = levelForNitrogen(input.nitrogen);
    scores.push(scoreFromLevel(level));
    notes.push(`Nitrogen is ${level} (${input.nitrogen} kg/ha).`);
    if (level === "low") {
      fertilizerNotes.push(
        "Nitrogen is low — consider a nitrogen-rich fertilizer (e.g. urea) or nitrogen-fixing green manure/compost; consult a local expert for the exact quantity for your soil and crop."
      );
    }
  }

  if (input.phosphorus !== undefined) {
    const level = levelForPhosphorus(input.phosphorus);
    scores.push(scoreFromLevel(level));
    notes.push(`Phosphorus is ${level} (${input.phosphorus} kg/ha).`);
    if (level === "low") {
      fertilizerNotes.push(
        "Phosphorus is low — consider a phosphate fertilizer (e.g. DAP/SSP) or well-decomposed organic manure; consult a local expert for the exact quantity."
      );
    }
  }

  if (input.potassium !== undefined) {
    const level = levelForPotassium(input.potassium);
    scores.push(scoreFromLevel(level));
    notes.push(`Potassium is ${level} (${input.potassium} kg/ha).`);
    if (level === "low") {
      fertilizerNotes.push(
        "Potassium is low — consider a potash fertilizer (e.g. MOP) or wood-ash/compost; consult a local expert for the exact quantity."
      );
    }
  }

  if (input.ph !== undefined) {
    const level = levelForPh(input.ph);
    scores.push(scoreFromLevel(level));
    notes.push(`Soil pH is ${input.ph} (${level === "optimal" ? "ideal range" : level}).`);
    if (input.ph < 5.5) {
      fertilizerNotes.push("Soil is strongly acidic — agricultural lime can help raise pH.");
    } else if (input.ph > 8.5) {
      fertilizerNotes.push("Soil is strongly alkaline — gypsum or organic matter can help lower pH.");
    }
  }

  if (input.organicCarbon !== undefined) {
    const level = levelForOrganicCarbon(input.organicCarbon);
    scores.push(scoreFromLevel(level));
    notes.push(`Organic carbon is ${level} (${input.organicCarbon}%).`);
    if (level === "low") {
      fertilizerNotes.push(
        "Organic carbon is low — adding compost, farmyard manure, or green manure improves long-term soil structure and fertility."
      );
    }
  }

  if (input.moisture !== undefined) {
    const description =
      input.moisture < 20 ? "dry" : input.moisture <= 40 ? "adequate" : "high";
    notes.push(`Soil moisture is ${description} (${input.moisture}%).`);
  }

  const healthScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : undefined;

  const interpretation =
    notes.length > 0
      ? notes.join(" ") +
        " (Educational estimate based on general Soil Health Card bands — not a certified lab interpretation.)"
      : "No soil parameters were provided, so a health interpretation could not be generated.";

  const fertilizerRecommendation =
    fertilizerNotes.length > 0
      ? fertilizerNotes.join(" ")
      : scores.length > 0
        ? "No major deficiencies detected in the provided readings. Maintain current practices and re-test periodically."
        : "Add soil readings to receive a fertilizer recommendation.";

  return { healthScore, interpretation, fertilizerRecommendation };
}
