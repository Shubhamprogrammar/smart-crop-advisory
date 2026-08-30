import { CropCalendar, ICropCalendar } from "../models/CropCalendar.model";
import { ApiError } from "../utils/ApiError";
import { getOwnedCycleOrThrow } from "./cropCycle.service";
import { CropStage } from "../constants/enums";

export async function getByCycle(cycleId: string, ownerId: string): Promise<ICropCalendar> {
  await getOwnedCycleOrThrow(cycleId, ownerId);

  const calendar = await CropCalendar.findOne({ cropCycle: cycleId });
  if (!calendar) {
    throw ApiError.notFound("Crop calendar not found for this cycle");
  }
  return calendar;
}

export async function updateTaskStatus(
  cycleId: string,
  ownerId: string,
  stageName: CropStage,
  taskId: string,
  status: "pending" | "done" | "skipped"
): Promise<ICropCalendar> {
  const calendar = await getByCycle(cycleId, ownerId);

  const stage = calendar.stages.find((s) => s.name === stageName);
  if (!stage) {
    throw ApiError.notFound(`Stage "${stageName}" not found in this calendar`);
  }

  const task = stage.tasks.find((t) => t._id.toString() === taskId);
  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  task.status = status;
  task.completedAt = status === "done" ? new Date() : undefined;

  await calendar.save();
  return calendar;
}
