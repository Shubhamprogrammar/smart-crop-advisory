import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import * as weatherService from "../services/weather.service";
import { WeatherByLocationQuery } from "../validators/weather.validator";

export async function getWeatherByLocation(req: Request, res: Response) {
  const { latitude, longitude } = req.query as unknown as WeatherByLocationQuery;
  const result = await weatherService.getWeatherByLocation(latitude, longitude);

  return sendSuccess(res, {
    message: result.stale ? (result.message ?? "Showing last known weather") : "Weather fetched",
    data: result,
  });
}

export async function getWeatherForFarm(req: Request, res: Response) {
  const result = await weatherService.getWeatherForFarm(req.params.farmId, req.user!.id);

  return sendSuccess(res, {
    message: result.stale ? (result.message ?? "Showing last known weather") : "Weather fetched",
    data: result,
  });
}
