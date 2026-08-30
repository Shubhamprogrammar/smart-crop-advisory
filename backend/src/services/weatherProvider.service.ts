/**
 * Weather provider: Open-Meteo (https://open-meteo.com).
 *
 * Chosen because it is free and requires no API key, which keeps the
 * project runnable out of the box for a hackathon judge/reviewer. It is
 * isolated behind this module specifically so it can be swapped for a keyed
 * provider (e.g. OpenWeatherMap, using WEATHER_API_KEY) later without
 * touching weather.service.ts or any route/controller code.
 */
import axios from "axios";
import { describeWeatherCode } from "../utils/weatherCodes";

// Exported so tests can point it at an unreachable address to exercise
// weather.service.ts's failure/fallback path without real network access.
export const client = axios.create({
  baseURL: "https://api.open-meteo.com/v1",
  timeout: 10000,
});

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  rainfall: number;
  rainProbability: number;
  windSpeed: number;
  condition: string;
  observedAt: string;
}

export interface ForecastDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  rainfall: number;
  rainProbability: number;
  condition: string;
}

export interface WeatherSnapshot {
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

function findClosestHourlyProbability(hourly: OpenMeteoResponse["hourly"], currentTime: string): number {
  const index = hourly.time.indexOf(currentTime);
  if (index !== -1) return hourly.precipitation_probability[index] ?? 0;

  // Fall back to the nearest hour if an exact match isn't found.
  const currentMs = new Date(currentTime).getTime();
  let closestIndex = 0;
  let closestDiff = Infinity;
  hourly.time.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - currentMs);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  });
  return hourly.precipitation_probability[closestIndex] ?? 0;
}

export async function fetchWeatherSnapshot(
  latitude: number,
  longitude: number
): Promise<WeatherSnapshot> {
  const { data } = await client.get<OpenMeteoResponse>("/forecast", {
    params: {
      latitude,
      longitude,
      current: "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
      hourly: "precipitation_probability",
      daily:
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
      timezone: "auto",
      forecast_days: 5,
    },
  });

  const current: CurrentWeather = {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    rainfall: data.current.precipitation,
    rainProbability: findClosestHourlyProbability(data.hourly, data.current.time),
    windSpeed: data.current.wind_speed_10m,
    condition: describeWeatherCode(data.current.weather_code),
    observedAt: data.current.time,
  };

  const forecast: ForecastDay[] = data.daily.time.map((date, i) => ({
    date,
    temperatureMax: data.daily.temperature_2m_max[i],
    temperatureMin: data.daily.temperature_2m_min[i],
    rainfall: data.daily.precipitation_sum[i],
    rainProbability: data.daily.precipitation_probability_max[i],
    condition: describeWeatherCode(data.daily.weather_code[i]),
  }));

  return { latitude, longitude, current, forecast };
}
