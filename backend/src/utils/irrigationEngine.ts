/**
 * Smart irrigation — rules + data, per spec §O. Deterministic and
 * inspectable (same discipline as disease-risk, Phase 9): every point
 * added to the urgency score is named in the returned `reason`.
 *
 * "Recommended amount/frequency where data supports it" (spec's own
 * phrasing) is deliberately qualitative (light/moderate/deep,
 * frequency in days) rather than exact mm/liters — a precise
 * engineering-grade figure would need real crop evapotranspiration
 * coefficients (Kc) and local climate normals this system doesn't have
 * verified data for; inventing a precise number would be exactly the
 * kind of fabrication the project's AI-safety rules forbid.
 */

import { CropStage } from "../constants/enums";

export interface IrrigationInput {
  cropStage: CropStage;
  temperature: number;
  humidity: number;
  rainProbability: number;
  soilMoisturePercent?: number;
}

export type IrrigationUrgency = "none" | "low" | "medium" | "high";
export type IrrigationAmount = "light" | "moderate" | "deep" | null;

export interface IrrigationRecommendation {
  irrigationRequired: boolean;
  urgency: IrrigationUrgency;
  recommendedAmount: IrrigationAmount;
  recommendedFrequencyDays: number | null;
  reason: string;
  moistureDataAvailable: boolean;
}

const HIGH_SENSITIVITY_STAGES: CropStage[] = ["flowering", "fruiting"];
const MODERATE_SENSITIVITY_STAGES: CropStage[] = ["sowing", "germination", "vegetative"];

const SATURATED_MOISTURE_PCT = 50;
const LOW_MOISTURE_PCT = 20;
const MODERATE_MOISTURE_PCT = 35;
const HIGH_RAIN_PROBABILITY = 60;

export function computeIrrigationRecommendation(input: IrrigationInput): IrrigationRecommendation {
  const moistureDataAvailable = input.soilMoisturePercent !== undefined;

  // Hard override: don't recommend irrigation onto already-saturated soil,
  // regardless of what other factors suggest.
  if (moistureDataAvailable && input.soilMoisturePercent! > SATURATED_MOISTURE_PCT) {
    return {
      irrigationRequired: false,
      urgency: "none",
      recommendedAmount: null,
      recommendedFrequencyDays: null,
      reason: `Soil moisture is already high (${input.soilMoisturePercent}%); irrigation is not needed.`,
      moistureDataAvailable,
    };
  }

  let score = 0;
  const reasons: string[] = [];

  if (moistureDataAvailable) {
    if (input.soilMoisturePercent! < LOW_MOISTURE_PCT) {
      score += 3;
      reasons.push(`soil moisture is low (${input.soilMoisturePercent}%)`);
    } else if (input.soilMoisturePercent! < MODERATE_MOISTURE_PCT) {
      score += 1;
      reasons.push(`soil moisture is moderate (${input.soilMoisturePercent}%)`);
    }
  } else {
    reasons.push("soil moisture data unavailable — add a soil report or connect a moisture sensor for a more accurate recommendation");
  }

  if (input.temperature >= 32) {
    score += 2;
    reasons.push(`high temperature (${input.temperature}°C) increases water loss`);
  } else if (input.temperature >= 24) {
    score += 1;
  }

  if (input.humidity < 40) {
    score += 1;
    reasons.push(`low humidity (${input.humidity}%) increases evapotranspiration`);
  }

  if (HIGH_SENSITIVITY_STAGES.includes(input.cropStage)) {
    score += 2;
    reasons.push(`crop is in the water-sensitive ${input.cropStage} stage`);
  } else if (MODERATE_SENSITIVITY_STAGES.includes(input.cropStage)) {
    score += 1;
  }

  const rainComing = input.rainProbability >= HIGH_RAIN_PROBABILITY;
  const criticallyDry = moistureDataAvailable && input.soilMoisturePercent! < 15;

  if (rainComing && !criticallyDry) {
    return {
      irrigationRequired: false,
      urgency: "none",
      recommendedAmount: null,
      recommendedFrequencyDays: null,
      reason: `Rain is likely soon (${input.rainProbability}% probability) — holding off avoids wasting water.`,
      moistureDataAvailable,
    };
  }

  let urgency: IrrigationUrgency;
  let recommendedAmount: IrrigationAmount;
  let recommendedFrequencyDays: number | null;

  if (score >= 6) {
    urgency = "high";
    recommendedAmount = "deep";
    recommendedFrequencyDays = 1;
  } else if (score >= 4) {
    urgency = "medium";
    recommendedAmount = "moderate";
    recommendedFrequencyDays = 2;
  } else if (score >= 2) {
    urgency = "low";
    recommendedAmount = "light";
    recommendedFrequencyDays = 4;
  } else {
    urgency = "none";
    recommendedAmount = null;
    recommendedFrequencyDays = null;
  }

  if (rainComing && criticallyDry) {
    reasons.push(
      `though rain is expected (${input.rainProbability}% probability), soil moisture is critically low — a light irrigation is still suggested`
    );
    urgency = "low";
    recommendedAmount = "light";
    recommendedFrequencyDays = 1;
  }

  const reason =
    reasons.length > 0
      ? reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1) + (reasons.length > 1 ? "; " + reasons.slice(1).join("; ") : "") + "."
      : "Current conditions and crop stage do not indicate a strong irrigation need.";

  return {
    irrigationRequired: urgency !== "none",
    urgency,
    recommendedAmount,
    recommendedFrequencyDays,
    reason,
    moistureDataAvailable,
  };
}
