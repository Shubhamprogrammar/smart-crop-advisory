import { AdvisoryRuleConfig } from "../models/AdvisoryRuleConfig.model";
import { DEFAULT_THRESHOLDS, RuleThresholds } from "./advisoryRules";

export async function getRuleThresholds(): Promise<RuleThresholds> {
  const doc = await AdvisoryRuleConfig.findOne();
  if (!doc) return DEFAULT_THRESHOLDS;

  return {
    heavyRainProbability: doc.heavyRainProbability,
    heavyRainMm: doc.heavyRainMm,
    strongWindKmh: doc.strongWindKmh,
    heatStressC: doc.heatStressC,
    coldStressC: doc.coldStressC,
  };
}

export async function updateRuleThresholds(
  updates: Partial<RuleThresholds>,
  updatedBy: string
): Promise<RuleThresholds> {
  const current = await getRuleThresholds();
  const merged = { ...current, ...updates };

  await AdvisoryRuleConfig.findOneAndUpdate(
    {},
    { $set: { ...merged, updatedBy } },
    { upsert: true, new: true }
  );

  return merged;
}
