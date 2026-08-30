import { MarketPrice } from "../models/MarketPrice.model";
import { Crop } from "../models/Crop.model";
import { ApiError } from "../utils/ApiError";
import { cacheGet, cacheSet } from "../utils/cache";
import { getOwnedFarmOrThrow } from "./farm.service";
import {
  getSimulatedPrice,
  findNearestMandis,
  SimulatedPrice,
} from "./marketDataProvider.service";
import { predictPriceTrend, PricePoint, TrendPrediction } from "../utils/priceTrend";

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour, per blueprint §9
const DEFAULT_MARKET = "National Average (simulated)";
const SIMULATED_DISCLAIMER =
  "This is simulated demo data, not a real market price. Connect a real data source (e.g. data.gov.in Agmarknet) for actual mandi prices.";

async function getKnownCrop(cropName: string) {
  const crop = await Crop.findOne({ name: cropName.toLowerCase() });
  if (!crop) {
    throw ApiError.badRequest(`Unknown crop "${cropName}"`);
  }
  return crop;
}

export interface CurrentPriceResult extends SimulatedPrice {
  crop: string;
  market: string;
  date: Date;
  unit: string;
  source: "simulated_demo";
  isSimulated: true;
  disclaimer: string;
}

export async function getCurrentPrice(cropName: string, market = DEFAULT_MARKET): Promise<CurrentPriceResult> {
  const crop = await getKnownCrop(cropName);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const cacheKey = `market:${crop.name}:${market}:${today.toISOString().slice(0, 10)}`;
  const cached = await cacheGet<CurrentPriceResult>(cacheKey);
  if (cached) return cached;

  const price = getSimulatedPrice(crop.name, market, today);

  const result: CurrentPriceResult = {
    ...price,
    crop: crop.name,
    market,
    date: today,
    unit: "quintal",
    source: "simulated_demo",
    isSimulated: true,
    disclaimer: SIMULATED_DISCLAIMER,
  };

  await cacheSet(cacheKey, result, CACHE_TTL_SECONDS);

  await MarketPrice.findOneAndUpdate(
    { crop: crop._id, market, date: today },
    {
      crop: crop._id,
      cropName: crop.name,
      market,
      date: today,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      modalPrice: price.modalPrice,
      unit: "quintal",
      source: "simulated_demo",
    },
    { upsert: true }
  );

  return result;
}

export async function getHistory(
  cropName: string,
  market = DEFAULT_MARKET,
  days = 14
): Promise<{ crop: string; market: string; history: (SimulatedPrice & { date: Date })[]; isSimulated: true; disclaimer: string }> {
  const crop = await getKnownCrop(cropName);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const history = Array.from({ length: days }, (_, i) => {
    const date = new Date(today.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return { date, ...getSimulatedPrice(crop.name, market, date) };
  });

  return { crop: crop.name, market, history, isSimulated: true, disclaimer: SIMULATED_DISCLAIMER };
}

export interface TrendResult {
  crop: string;
  market: string;
  prediction: TrendPrediction;
  source: "ai_prediction";
  isSimulated: true;
  disclaimer: string;
}

export async function getTrend(cropName: string, market = DEFAULT_MARKET): Promise<TrendResult> {
  const { crop, history } = await getHistory(cropName, market, 14);

  const points: PricePoint[] = history.map((h) => ({ date: h.date, modalPrice: h.modalPrice }));
  const prediction = predictPriceTrend(points);

  if (!prediction) {
    throw ApiError.internal("Not enough price history to compute a trend.");
  }

  return {
    crop,
    market,
    prediction,
    source: "ai_prediction",
    isSimulated: true,
    disclaimer:
      SIMULATED_DISCLAIMER + " The trend itself is computed (linear regression) but over simulated input data.",
  };
}

export async function getNearbyMandis(farmId: string, ownerId: string) {
  const farm = await getOwnedFarmOrThrow(farmId, ownerId);
  const [longitude, latitude] = farm.location.coordinates;
  return {
    mandis: findNearestMandis(latitude, longitude),
    note: "Mandi names and locations are real; distances are approximate (city-level coordinates).",
  };
}

export async function getMarketComparison(cropName: string, farmId: string, ownerId: string) {
  const farm = await getOwnedFarmOrThrow(farmId, ownerId);
  const [longitude, latitude] = farm.location.coordinates;
  const crop = await getKnownCrop(cropName);

  const mandis = findNearestMandis(latitude, longitude);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const comparison = mandis
    .map((m) => ({
      market: m.name,
      state: m.state,
      distanceKm: m.distanceKm,
      ...getSimulatedPrice(crop.name, m.name, today),
    }))
    .sort((a, b) => b.modalPrice - a.modalPrice);

  return {
    crop: crop.name,
    comparison,
    bestMarket: comparison[0]?.market,
    isSimulated: true,
    disclaimer: SIMULATED_DISCLAIMER,
  };
}

export async function getSellingRecommendation(cropName: string, farmId: string, ownerId: string) {
  const { prediction } = await getTrend(cropName);
  const current = await getCurrentPrice(cropName);
  const comparison = await getMarketComparison(cropName, farmId, ownerId);

  let recommendation: string;
  if (prediction.direction === "rising") {
    recommendation =
      "Prices appear to be trending upward. If you can afford to wait and have storage, holding a few more days may fetch a better price.";
  } else if (prediction.direction === "falling") {
    recommendation =
      "Prices appear to be trending downward. If your crop is ready and storage is limited, selling soon may be preferable to waiting.";
  } else {
    recommendation = "Prices appear stable. Selling now or waiting a few days is unlikely to make a large difference.";
  }

  if (comparison.bestMarket && comparison.bestMarket !== current.market) {
    recommendation += ` ${comparison.comparison[0].market} currently shows the highest price among nearby markets.`;
  }

  return {
    crop: current.crop,
    currentPrice: current.modalPrice,
    trendDirection: prediction.direction,
    bestNearbyMarket: comparison.bestMarket,
    recommendation,
    isSimulated: true,
    disclaimer: SIMULATED_DISCLAIMER + " This suggestion is a rule-based estimate, not financial advice.",
  };
}
