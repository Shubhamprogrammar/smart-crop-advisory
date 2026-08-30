/**
 * Smart advisory rule engine.
 *
 * Per the spec's own architecture (§2: "Node.js should handle: ...
 * Advisories ...") and explicit instruction ("Do NOT let an LLM
 * independently make all agricultural decisions. Use Rules + ML + Data +
 * LLM"), advisory generation here is entirely deterministic — each rule
 * is a pure function over real data (soil report, live weather, the
 * disease-risk assessment from Phase 9, recent disease detections from
 * Phase 8). There is no LLM in this phase; farmer-friendly phrasing
 * adaptation and translation are layered on in later phases (AI
 * assistant / multilingual), not invented here.
 *
 * Market data is deliberately not used as an input yet — market
 * intelligence (Phase 14) doesn't exist in this codebase yet, and
 * fabricating a market-based rule without real price data would violate
 * the project's "never fabricate market prices" rule.
 */
import { IFarm } from "../models/Farm.model";
import { ICropCycle } from "../models/CropCycle.model";
import { ISoilReport } from "../models/SoilReport.model";
import { IDiseaseRisk } from "../models/DiseaseRisk.model";
import { IDiseaseDetection } from "../models/DiseaseDetection.model";
import { WeatherResult } from "./weather.service";
import { NotificationType, PriorityLevel } from "../constants/enums";
import { computeIrrigationRecommendation } from "../utils/irrigationEngine";

export interface AdvisoryContext {
  farm: IFarm;
  cycle: ICropCycle | null;
  soilReport: ISoilReport | null;
  weather: WeatherResult | null;
  diseaseRisk: IDiseaseRisk | null;
  recentDiseaseDetections: IDiseaseDetection[];
}

export interface AdvisoryCandidate {
  type: NotificationType;
  priority: PriorityLevel;
  title: string;
  reason: string;
  action: string;
  deadline?: Date;
  sourceData?: Record<string, unknown>;
}

function inDays(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// --- Weather rules -----------------------------------------------------
//
// Thresholds are admin-configurable (Phase 19, spec §16) via
// AdvisoryRuleConfig. DEFAULT_THRESHOLDS is the fallback used whenever no
// config document exists yet, so this engine never depends on the DB call
// having succeeded.

export interface RuleThresholds {
  heavyRainProbability: number;
  heavyRainMm: number;
  strongWindKmh: number;
  heatStressC: number;
  coldStressC: number;
}

export const DEFAULT_THRESHOLDS: RuleThresholds = {
  heavyRainProbability: 70,
  heavyRainMm: 10,
  strongWindKmh: 25,
  heatStressC: 40,
  coldStressC: 5,
};

export function heavyRainRule(
  ctx: AdvisoryContext,
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS
): AdvisoryCandidate | null {
  const weather = ctx.weather?.snapshot;
  if (!weather) return null;

  const todayHeavy = weather.current.rainProbability >= thresholds.heavyRainProbability;
  const tomorrowHeavy =
    (weather.forecast[1]?.rainProbability ?? 0) >= thresholds.heavyRainProbability &&
    (weather.forecast[1]?.rainfall ?? 0) >= thresholds.heavyRainMm;

  if (!todayHeavy && !tomorrowHeavy) return null;

  const actions = ["Do not irrigate", "Avoid pesticide/fertilizer spraying"];
  if (ctx.cycle?.currentStage === "harvest") {
    actions.push("Protect harvested crop from moisture damage");
  }

  return {
    type: "weather",
    priority: "high",
    title: "Heavy rainfall expected",
    reason: todayHeavy
      ? `Rain probability today is ${weather.current.rainProbability}%.`
      : `Rain probability tomorrow is ${weather.forecast[1]?.rainProbability}% with ${weather.forecast[1]?.rainfall}mm expected.`,
    action: actions.join(". ") + ".",
    deadline: inDays(1),
    sourceData: { rainProbability: weather.current.rainProbability, forecast: weather.forecast[1] },
  };
}

export function strongWindRule(
  ctx: AdvisoryContext,
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS
): AdvisoryCandidate | null {
  const current = ctx.weather?.snapshot.current;
  if (!current || current.windSpeed < thresholds.strongWindKmh) return null;

  return {
    type: "pest",
    priority: "medium",
    title: "Strong wind — avoid spraying",
    reason: `Wind speed is ${current.windSpeed} km/h, which reduces spray effectiveness and increases drift risk.`,
    action: "Avoid spraying pesticides or fertilizers until wind conditions calm down.",
    sourceData: { windSpeed: current.windSpeed },
  };
}

export function extremeTemperatureRule(
  ctx: AdvisoryContext,
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS
): AdvisoryCandidate | null {
  const current = ctx.weather?.snapshot.current;
  if (!current) return null;

  if (current.temperature >= thresholds.heatStressC) {
    return {
      type: "weather",
      priority: "high",
      title: "Extreme heat — crop protection advisory",
      reason: `Temperature is ${current.temperature}°C, which can stress crops and increase water demand.`,
      action: "Ensure adequate irrigation, avoid midday field work, and consider shade netting for sensitive crops.",
      sourceData: { temperature: current.temperature },
    };
  }

  if (current.temperature <= thresholds.coldStressC) {
    return {
      type: "weather",
      priority: "high",
      title: "Extreme cold — crop protection advisory",
      reason: `Temperature is ${current.temperature}°C, which risks frost/cold damage to sensitive crops.`,
      action: "Consider protective covering overnight and delay irrigation (wet soil increases frost risk).",
      sourceData: { temperature: current.temperature },
    };
  }

  return null;
}

// --- Soil rule -----------------------------------------------------------

export function soilHealthRule(ctx: AdvisoryContext): AdvisoryCandidate | null {
  const soil = ctx.soilReport;
  if (!soil || soil.healthScore === undefined || soil.healthScore >= 50) return null;

  return {
    type: "fertilizer",
    priority: soil.healthScore < 35 ? "high" : "medium",
    title: "Soil health needs attention",
    reason: soil.interpretation ?? `Soil health score is ${soil.healthScore}/100.`,
    action: soil.fertilizerRecommendation ?? "Consider a soil test and fertilizer plan with a local expert.",
    sourceData: { healthScore: soil.healthScore },
  };
}

// --- Irrigation rule (consumes Phase 15's dedicated engine, doesn't
// duplicate its logic) ----------------------------------------------------

export function irrigationNeedRule(ctx: AdvisoryContext): AdvisoryCandidate | null {
  const weather = ctx.weather?.snapshot;
  if (!ctx.cycle || !weather) return null;

  const rec = computeIrrigationRecommendation({
    cropStage: ctx.cycle.currentStage,
    temperature: weather.current.temperature,
    humidity: weather.current.humidity,
    rainProbability: weather.current.rainProbability,
    soilMoisturePercent: ctx.soilReport?.moisture,
  });

  if (!rec.irrigationRequired) return null;

  return {
    type: "irrigation",
    priority: rec.urgency === "high" ? "high" : "medium",
    title: "Irrigation recommended",
    reason: rec.reason,
    action: rec.recommendedAmount
      ? `Apply a ${rec.recommendedAmount} irrigation; re-check in about ${rec.recommendedFrequencyDays} day(s).`
      : "Irrigate soon.",
    deadline: inDays(rec.recommendedFrequencyDays ?? 2),
    sourceData: { urgency: rec.urgency, moistureDataAvailable: rec.moistureDataAvailable },
  };
}

// --- Disease-risk rule (consumes Phase 9's output, doesn't recompute it) -

export function diseaseRiskRule(ctx: AdvisoryContext): AdvisoryCandidate | null {
  const risk = ctx.diseaseRisk;
  if (!risk || risk.riskLevel === "low") return null;

  return {
    type: "disease",
    priority: risk.riskLevel === "high" ? "high" : "medium",
    title: `${risk.riskLevel === "high" ? "High" : "Medium"} disease risk`,
    reason: risk.reason,
    action: risk.preventiveAction,
    sourceData: { riskLevel: risk.riskLevel, weatherSnapshot: risk.weatherSnapshot },
  };
}

// --- Recent disease detection rule (consumes Phase 8's output) -----------

export function recentDiseaseDetectionRule(ctx: AdvisoryContext): AdvisoryCandidate[] {
  const uniqueDiseases = new Map<string, IDiseaseDetection>();
  for (const detection of ctx.recentDiseaseDetections) {
    if (detection.predictedDisease && !uniqueDiseases.has(detection.predictedDisease)) {
      uniqueDiseases.set(detection.predictedDisease, detection);
    }
  }

  return Array.from(uniqueDiseases.values()).map((detection) => ({
    type: "disease" as const,
    priority: "high" as const,
    title: `Disease detected: ${detection.predictedDisease}`,
    reason: `A recent image scan identified ${detection.predictedDisease} with ${Math.round((detection.confidence ?? 0) * 100)}% confidence.`,
    action: detection.recommendedAction,
    deadline: inDays(3),
    sourceData: { detectionId: detection._id.toString(), confidence: detection.confidence },
  }));
}

export function runAllRules(
  ctx: AdvisoryContext,
  thresholds: RuleThresholds = DEFAULT_THRESHOLDS
): AdvisoryCandidate[] {
  const weatherRules = [heavyRainRule, strongWindRule, extremeTemperatureRule];
  const otherRules = [soilHealthRule, irrigationNeedRule, diseaseRiskRule];

  const results: AdvisoryCandidate[] = [];
  for (const rule of weatherRules) {
    const candidate = rule(ctx, thresholds);
    if (candidate) results.push(candidate);
  }
  for (const rule of otherRules) {
    const candidate = rule(ctx);
    if (candidate) results.push(candidate);
  }

  results.push(...recentDiseaseDetectionRule(ctx));

  return results;
}
