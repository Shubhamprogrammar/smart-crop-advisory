import { apiClient, unwrap } from "@/lib/apiClient";

export interface CurrentPriceResult {
  crop: string;
  market: string;
  date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  isSimulated: boolean;
  disclaimer: string;
}

export interface TrendResult {
  crop: string;
  prediction: {
    direction: "rising" | "falling" | "stable";
    predictedNextDays: { date: string; predictedPrice: number }[];
  };
  isSimulated: boolean;
  disclaimer: string;
}

export interface SellingRecommendation {
  crop: string;
  currentPrice: number;
  trendDirection: string;
  bestNearbyMarket?: string;
  recommendation: string;
  isSimulated: boolean;
  disclaimer: string;
}

export async function getCurrentPrice(cropName: string): Promise<CurrentPriceResult> {
  return unwrap(apiClient.get(`/api/market/price/${cropName}`));
}

export async function getTrend(cropName: string): Promise<TrendResult> {
  return unwrap(apiClient.get(`/api/market/trend/${cropName}`));
}

export async function getSellingRecommendation(cropName: string, farmId: string): Promise<SellingRecommendation> {
  return unwrap(apiClient.get(`/api/market/recommendation/${cropName}`, { params: { farmId } }));
}
