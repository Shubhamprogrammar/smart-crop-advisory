import { calculateProfit } from "../src/utils/profitCalculator";
import { computeSoilHealth } from "../src/utils/soilHealth";
import { describeWeatherCode } from "../src/utils/weatherCodes";
import { predictPriceTrend } from "../src/utils/priceTrend";
import {
  getSimulatedPrice,
  findNearestMandis,
  haversineDistanceKm,
} from "../src/services/marketDataProvider.service";

describe("profitCalculator (unit)", () => {
  it("computes totals, revenue, profit, and ROI", () => {
    const r = calculateProfit({
      landAreaAcres: 4,
      seedCost: 1000,
      fertilizerCost: 2000,
      pesticideCost: 1000,
      labourCost: 3000,
      irrigationCost: 1000,
      otherCosts: 500,
      expectedYield: 80,
      yieldUnit: "quintal",
      marketPrice: 3000,
    });

    expect(r.totalCost).toBe(8500);
    expect(r.expectedRevenue).toBe(240000);
    expect(r.expectedProfit).toBe(231500);
    expect(r.roiPercent).toBe(Math.round((231500 / 8500) * 10000) / 100);
    expect(r.costPerAcre).toBe(2125);
    expect(r.isEstimate).toBe(true);
  });

  it("returns null ROI/per-acre when cost is zero", () => {
    const r = calculateProfit({
      seedCost: 0,
      fertilizerCost: 0,
      pesticideCost: 0,
      labourCost: 0,
      irrigationCost: 0,
      otherCosts: 0,
      expectedYield: 0,
      yieldUnit: "quintal",
      marketPrice: 0,
    });
    expect(r.roiPercent).toBeNull();
    expect(r.costPerAcre).toBeNull();
    expect(r.profitPerAcre).toBeNull();
  });
});

describe("computeSoilHealth (unit)", () => {
  it("returns optimal for a balanced pH", () => {
    const r = computeSoilHealth({ ph: 7 });
    expect(r.healthScore).toBe(100);
  });

  it("returns a lower score for low nitrogen", () => {
    const r = computeSoilHealth({ nitrogen: 100 });
    expect(r.healthScore).toBe(35);
    expect(r.fertilizerRecommendation).toMatch(/nitrogen/i);
  });

  it("never fabricates a reading for missing fields", () => {
    const r = computeSoilHealth({});
    expect(r.healthScore).toBeUndefined();
    expect(r.interpretation).toBeTruthy();
  });

  it("averages over only provided parameters", () => {
    const r = computeSoilHealth({ nitrogen: 300, phosphorus: 12 });
    // nitrogen=300 -> medium (70), phosphorus=12 -> medium (70)
    expect(r.healthScore).toBe(70);
  });
});

describe("describeWeatherCode (unit)", () => {
  it("maps known WMO codes", () => {
    expect(describeWeatherCode(0)).toBeDefined();
    expect(describeWeatherCode(95)).toBeDefined();
  });
  it("handles undefined gracefully", () => {
    expect(describeWeatherCode(undefined)).toBeTruthy();
  });
});

describe("predictPriceTrend (unit)", () => {
  it("detects a rising trend from increasing prices", () => {
    const history = Array.from({ length: 14 }, (_, i) => ({
      date: new Date(2026, 0, i + 1),
      modalPrice: 100 + i * 10,
    }));
    const p = predictPriceTrend(history);
    expect(p).not.toBeNull();
    expect(p!.direction).toBe("rising");
  });

  it("detects a falling trend from decreasing prices", () => {
    const history = Array.from({ length: 14 }, (_, i) => ({
      date: new Date(2026, 0, i + 1),
      modalPrice: 200 - i * 10,
    }));
    const p = predictPriceTrend(history);
    expect(p).not.toBeNull();
    expect(p!.direction).toBe("falling");
  });

  it("returns null for insufficient data", () => {
    expect(predictPriceTrend([{ date: new Date(), modalPrice: 100 }])).toBeNull();
  });
});

describe("marketDataProvider (unit)", () => {
  it("returns a deterministic simulated price for the same inputs", () => {
    const a = getSimulatedPrice("tomato", "Pune APMC (Market Yard)", new Date("2026-01-15"));
    const b = getSimulatedPrice("tomato", "Pune APMC (Market Yard)", new Date("2026-01-15"));
    expect(a).toEqual(b);
    expect(a.modalPrice).toBeGreaterThan(0);
    expect(a.minPrice).toBeLessThanOrEqual(a.modalPrice);
    expect(a.maxPrice).toBeGreaterThanOrEqual(a.modalPrice);
  });

  it("sorts mandis by distance", () => {
    const near = findNearestMandis(18.5074, 73.8677, 3);
    expect(near).toHaveLength(3);
    for (let i = 1; i < near.length; i++) {
      expect(near[i].distanceKm).toBeGreaterThanOrEqual(near[i - 1].distanceKm);
    }
  });

  it("computes haversine distance for known coordinates", () => {
    // Same point -> 0 km
    expect(haversineDistanceKm(0, 0, 0, 0)).toBe(0);
    // Roughly 1 degree latitude ~ 111km
    expect(haversineDistanceKm(0, 0, 1, 0)).toBeGreaterThan(100);
    expect(haversineDistanceKm(0, 0, 1, 0)).toBeLessThan(130);
  });
});
