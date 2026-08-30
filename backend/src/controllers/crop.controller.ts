import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeCrop } from "../utils/sanitizeCropCycle";
import * as cropService from "../services/crop.service";
import * as cropCycleService from "../services/cropCycle.service";
import { sanitizeCropCycle } from "../utils/sanitizeCropCycle";
import { StartCropCycleInput, AdvanceStageInput } from "../validators/cropCycle.validator";

export async function listCrops(_req: Request, res: Response) {
  const crops = await cropService.listCrops();
  return sendSuccess(res, { message: "Crops fetched", data: { crops: crops.map(sanitizeCrop) } });
}

export async function getCrop(req: Request, res: Response) {
  const crop = await cropService.getCropByName(req.params.name);
  return sendSuccess(res, { message: "Crop fetched", data: { crop: sanitizeCrop(crop) } });
}

export async function startCropCycle(req: Request, res: Response) {
  const input = req.body as StartCropCycleInput;
  const cycle = await cropCycleService.startCropCycle(req.params.farmId, req.user!.id, input);
  return sendSuccess(res, {
    message: "Crop cycle started and calendar generated",
    data: { cycle: sanitizeCropCycle(cycle) },
    statusCode: 201,
  });
}

export async function getActiveCycle(req: Request, res: Response) {
  const cycle = await cropCycleService.getActiveCycle(req.params.farmId, req.user!.id);
  return sendSuccess(res, {
    message: cycle ? "Active crop cycle fetched" : "No active crop cycle",
    data: { cycle: cycle ? sanitizeCropCycle(cycle) : null },
  });
}

export async function listCycles(req: Request, res: Response) {
  const cycles = await cropCycleService.listCycles(req.params.farmId, req.user!.id);
  return sendSuccess(res, { message: "Crop cycles fetched", data: { cycles: cycles.map(sanitizeCropCycle) } });
}

export async function advanceStage(req: Request, res: Response) {
  const { stage } = req.body as AdvanceStageInput;
  const cycle = await cropCycleService.advanceStage(req.params.id, req.user!.id, stage);
  return sendSuccess(res, { message: "Stage updated", data: { cycle: sanitizeCropCycle(cycle) } });
}

export async function completeCycle(req: Request, res: Response) {
  const cycle = await cropCycleService.completeCycle(req.params.id, req.user!.id);
  return sendSuccess(res, { message: "Crop cycle marked completed", data: { cycle: sanitizeCropCycle(cycle) } });
}
