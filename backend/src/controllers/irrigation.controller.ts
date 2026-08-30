import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import * as irrigationService from "../services/irrigation.service";

export async function getRecommendation(req: Request, res: Response) {
  const result = await irrigationService.getIrrigationRecommendation(req.params.farmId, req.user!.id);
  return sendSuccess(res, { message: "Irrigation recommendation computed", data: result });
}
