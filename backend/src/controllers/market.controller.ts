import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import * as marketService from "../services/market.service";
import { MarketQuery } from "../validators/market.validator";

export async function getCurrentPrice(req: Request, res: Response) {
  const { market } = req.query as unknown as MarketQuery;
  const result = await marketService.getCurrentPrice(req.params.cropName, market);
  return sendSuccess(res, { message: "Current price fetched", data: result });
}

export async function getHistory(req: Request, res: Response) {
  const { market, days } = req.query as unknown as MarketQuery;
  const result = await marketService.getHistory(req.params.cropName, market, days);
  return sendSuccess(res, { message: "Price history fetched", data: result });
}

export async function getTrend(req: Request, res: Response) {
  const { market } = req.query as unknown as MarketQuery;
  const result = await marketService.getTrend(req.params.cropName, market);
  return sendSuccess(res, { message: "Price trend computed", data: result });
}

export async function getNearbyMandis(req: Request, res: Response) {
  const result = await marketService.getNearbyMandis(req.params.farmId, req.user!.id);
  return sendSuccess(res, { message: "Nearby mandis fetched", data: result });
}

export async function getMarketComparison(req: Request, res: Response) {
  const { farmId } = req.query as { farmId: string };
  const result = await marketService.getMarketComparison(req.params.cropName, farmId, req.user!.id);
  return sendSuccess(res, { message: "Market comparison fetched", data: result });
}

export async function getSellingRecommendation(req: Request, res: Response) {
  const { farmId } = req.query as { farmId: string };
  const result = await marketService.getSellingRecommendation(req.params.cropName, farmId, req.user!.id);
  return sendSuccess(res, { message: "Selling recommendation computed", data: result });
}
