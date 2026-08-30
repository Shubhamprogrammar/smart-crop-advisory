import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeFarm } from "../utils/sanitizeFarm";
import * as farmService from "../services/farm.service";
import { CreateFarmInput, UpdateFarmInput } from "../validators/farm.validator";

export async function createFarm(req: Request, res: Response) {
  const input = req.body as CreateFarmInput;
  const farm = await farmService.createFarm(req.user!.id, input);
  return sendSuccess(res, {
    message: "Farm created",
    data: { farm: sanitizeFarm(farm) },
    statusCode: 201,
  });
}

export async function listFarms(req: Request, res: Response) {
  const farms = await farmService.listMyFarms(req.user!.id);
  return sendSuccess(res, {
    message: "Farms fetched",
    data: { farms: farms.map(sanitizeFarm) },
  });
}

export async function getFarm(req: Request, res: Response) {
  const farm = await farmService.getFarm(req.params.id, req.user!.id);
  return sendSuccess(res, { message: "Farm fetched", data: { farm: sanitizeFarm(farm) } });
}

export async function updateFarm(req: Request, res: Response) {
  const input = req.body as UpdateFarmInput;
  const farm = await farmService.updateFarm(req.params.id, req.user!.id, input);
  return sendSuccess(res, { message: "Farm updated", data: { farm: sanitizeFarm(farm) } });
}

export async function deleteFarm(req: Request, res: Response) {
  await farmService.deleteFarm(req.params.id, req.user!.id);
  return sendSuccess(res, { message: "Farm deleted" });
}
