import { apiClient, unwrap } from "@/lib/apiClient";

export interface WeatherSnapshot {
  latitude: number;
  longitude: number;
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    rainProbability: number;
    windSpeed: number;
    condition: string;
    observedAt: string;
  };
  forecast: {
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    rainfall: number;
    rainProbability: number;
    condition: string;
  }[];
}

export interface WeatherResult {
  snapshot: WeatherSnapshot;
  source: "cache" | "api" | "stale_fallback";
  stale: boolean;
  message?: string;
}

export async function getFarmWeather(farmId: string): Promise<WeatherResult> {
  return unwrap(apiClient.get(`/api/weather/farm/${farmId}`));
}
