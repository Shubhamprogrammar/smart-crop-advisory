import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeCropCalendar } from "../utils/sanitizeCropCycle";
import * as calendarService from "../services/cropCalendar.service";
import { UpdateTaskInput } from "../validators/cropCycle.validator";

export async function getCalendar(req: Request, res: Response) {
  const calendar = await calendarService.getByCycle(req.params.cycleId, req.user!.id);
  return sendSuccess(res, { message: "Crop calendar fetched", data: { calendar: sanitizeCropCalendar(calendar) } });
}

export async function updateTask(req: Request, res: Response) {
  const { stage, taskId, status } = req.body as UpdateTaskInput;
  const calendar = await calendarService.updateTaskStatus(
    req.params.cycleId,
    req.user!.id,
    stage,
    taskId,
    status
  );
  return sendSuccess(res, { message: "Task updated", data: { calendar: sanitizeCropCalendar(calendar) } });
}
