import { WeatherData } from "../models/WeatherData.model";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { cacheGet, cacheSet } from "../utils/cache";
import { getOwnedFarmOrThrow } from "./farm.service";
import { fetchWeatherSnapshot, WeatherSnapshot } from "./weatherProvider.service";

const CACHE_TTL_SECONDS = 30 * 60; // 30 minutes, per blueprint §8

export interface WeatherResult {
  snapshot: WeatherSnapshot;
  source: "cache" | "api" | "stale_fallback";
  stale: boolean;
  message?: string;
}

function buildLocationKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(2)}:${longitude.toFixed(2)}`;
}

function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function persistCurrentSnapshot(locationKey: string, snapshot: WeatherSnapshot): Promise<void> {
  try {
    await WeatherData.findOneAndUpdate(
      { locationKey, date: startOfDayUTC(new Date()) },
      {
        location: { type: "Point", coordinates: [snapshot.longitude, snapshot.latitude] },
        locationKey,
        date: startOfDayUTC(new Date()),
        temperature: snapshot.current.temperature,
        humidity: snapshot.current.humidity,
        rainfall: snapshot.current.rainfall,
        rainProbability: snapshot.current.rainProbability,
        windSpeed: snapshot.current.windSpeed,
        condition: snapshot.current.condition,
        source: "api",
        fetchedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    // Persisting is best-effort (used only for stale fallback); never fail the request over it.
    logger.warn("Failed to persist weather snapshot", { locationKey, err });
  }
}

async function staleFallback(locationKey: string): Promise<WeatherResult> {
  const lastKnown = await WeatherData.findOne({ locationKey }).sort({ date: -1 });

  if (!lastKnown) {
    throw ApiError.internal("Weather information is temporarily unavailable.");
  }

  const [longitude, latitude] = lastKnown.location.coordinates;

  return {
    source: "stale_fallback",
    stale: true,
    message: "Live weather is temporarily unavailable — showing the last known reading.",
    snapshot: {
      latitude,
      longitude,
      current: {
        temperature: lastKnown.temperature ?? 0,
        humidity: lastKnown.humidity ?? 0,
        rainfall: lastKnown.rainfall ?? 0,
        rainProbability: lastKnown.rainProbability ?? 0,
        windSpeed: lastKnown.windSpeed ?? 0,
        condition: lastKnown.condition ?? "Unknown",
        observedAt: lastKnown.fetchedAt.toISOString(),
      },
      forecast: [],
    },
  };
}

export async function getWeatherByLocation(latitude: number, longitude: number): Promise<WeatherResult> {
  const locationKey = buildLocationKey(latitude, longitude);
  const cacheKey = `weather:${locationKey}`;

  const cached = await cacheGet<WeatherSnapshot>(cacheKey);
  if (cached) {
    return { snapshot: cached, source: "cache", stale: false };
  }

  try {
    const snapshot = await fetchWeatherSnapshot(latitude, longitude);
    await cacheSet(cacheKey, snapshot, CACHE_TTL_SECONDS);
    await persistCurrentSnapshot(locationKey, snapshot);
    return { snapshot, source: "api", stale: false };
  } catch (err) {
    logger.warn("Weather provider request failed, attempting stale fallback", { locationKey, err });
    return staleFallback(locationKey);
  }
}

export async function getWeatherForFarm(farmId: string, ownerId: string): Promise<WeatherResult> {
  const farm = await getOwnedFarmOrThrow(farmId, ownerId);
  const [longitude, latitude] = farm.location.coordinates;
  return getWeatherByLocation(latitude, longitude);
}
