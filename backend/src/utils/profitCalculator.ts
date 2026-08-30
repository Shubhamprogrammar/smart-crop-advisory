/**
 * Profitability calculator — pure deterministic arithmetic, per spec §17:
 *   totalCost = seed + fertilizer + pesticide + labour + irrigation + otherCosts
 *   revenue = expectedYield × marketPrice
 *   profit = revenue - totalCost
 *   ROI = profit / totalCost × 100
 *
 * No AI or external data involved — market price and expected yield are
 * always explicit farmer inputs (Market Intelligence, Phase 14, doesn't
 * exist yet to auto-fill a real price; even once it does, "expected"
 * yield is inherently the farmer's own estimate, not something to
 * fabricate). Every result is explicitly labeled an estimate.
 */

export interface ProfitCalculatorInput {
  landAreaAcres?: number;
  seedCost: number;
  fertilizerCost: number;
  pesticideCost: number;
  labourCost: number;
  irrigationCost: number;
  otherCosts: number;
  expectedYield: number;
  yieldUnit: string;
  marketPrice: number;
}

export interface ProfitCalculatorResult {
  breakdown: {
    seedCost: number;
    fertilizerCost: number;
    pesticideCost: number;
    labourCost: number;
    irrigationCost: number;
    otherCosts: number;
  };
  totalCost: number;
  expectedRevenue: number;
  expectedProfit: number;
  roiPercent: number | null;
  costPerAcre: number | null;
  profitPerAcre: number | null;
  yieldUnit: string;
  isEstimate: true;
  disclaimer: string;
}

const DISCLAIMER =
  "This is an estimate based on the figures you provided (including your expected yield and market price). Actual costs, yield, and market prices may vary.";

export function calculateProfit(input: ProfitCalculatorInput): ProfitCalculatorResult {
  const totalCost =
    input.seedCost +
    input.fertilizerCost +
    input.pesticideCost +
    input.labourCost +
    input.irrigationCost +
    input.otherCosts;

  const expectedRevenue = input.expectedYield * input.marketPrice;
  const expectedProfit = expectedRevenue - totalCost;
  const roiPercent = totalCost > 0 ? (expectedProfit / totalCost) * 100 : null;

  const hasArea = input.landAreaAcres !== undefined && input.landAreaAcres > 0;
  const costPerAcre = hasArea ? totalCost / input.landAreaAcres! : null;
  const profitPerAcre = hasArea ? expectedProfit / input.landAreaAcres! : null;

  return {
    breakdown: {
      seedCost: input.seedCost,
      fertilizerCost: input.fertilizerCost,
      pesticideCost: input.pesticideCost,
      labourCost: input.labourCost,
      irrigationCost: input.irrigationCost,
      otherCosts: input.otherCosts,
    },
    totalCost,
    expectedRevenue,
    expectedProfit,
    roiPercent: roiPercent !== null ? Math.round(roiPercent * 100) / 100 : null,
    costPerAcre: costPerAcre !== null ? Math.round(costPerAcre * 100) / 100 : null,
    profitPerAcre: profitPerAcre !== null ? Math.round(profitPerAcre * 100) / 100 : null,
    yieldUnit: input.yieldUnit,
    isEstimate: true,
    disclaimer: DISCLAIMER,
  };
}
