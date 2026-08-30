/**
 * Simple least-squares linear regression over a price history, used to
 * extrapolate a short-term trend. This is real (if simple) statistical
 * computation over whatever price data is available — it is not an
 * invented number, but its output is only as trustworthy as its input,
 * which right now is simulated demo data (see marketDataProvider.service.ts).
 * Always tagged source: "ai_prediction" by callers, never "real_data".
 */

export interface PricePoint {
  date: Date;
  modalPrice: number;
}

export interface TrendPrediction {
  slopePerDay: number;
  direction: "rising" | "falling" | "stable";
  predictedNextDays: { date: Date; predictedPrice: number }[];
}

const STABLE_THRESHOLD_PCT_PER_DAY = 0.15;

export function predictPriceTrend(history: PricePoint[], forecastDays = 5): TrendPrediction | null {
  if (history.length < 3) return null;

  const sorted = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
  const t0 = sorted[0].date.getTime();
  const xs = sorted.map((p) => (p.date.getTime() - t0) / (24 * 60 * 60 * 1000));
  const ys = sorted.map((p) => p.modalPrice);

  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumXX = xs.reduce((sum, x) => sum + x * x, 0);

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  const meanPrice = sumY / n;
  const slopePctPerDay = meanPrice > 0 ? (slope / meanPrice) * 100 : 0;

  const direction: TrendPrediction["direction"] =
    Math.abs(slopePctPerDay) < STABLE_THRESHOLD_PCT_PER_DAY
      ? "stable"
      : slope > 0
        ? "rising"
        : "falling";

  const lastX = xs[xs.length - 1];
  const lastDate = sorted[sorted.length - 1].date;
  const predictedNextDays = Array.from({ length: forecastDays }, (_, i) => {
    const x = lastX + i + 1;
    const date = new Date(lastDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
    return { date, predictedPrice: Math.max(0, Math.round(intercept + slope * x)) };
  });

  return { slopePerDay: Math.round(slope * 100) / 100, direction, predictedNextDays };
}
