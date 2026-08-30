import { z } from "zod";
import { CROP_STAGES, SEASONS } from "../constants/enums";
import { objectIdParamSchema } from "./common.validator";

export const startCropCycleSchema = z.object({
  cropName: z.string().trim().min(2).max(50),
  sowingDate: z.coerce.date().optional(),
  areaAcres: z.number().min(0.01).max(100000).optional(),
  season: z.enum(SEASONS).optional(),
});

export type StartCropCycleInput = z.infer<typeof startCropCycleSchema>;

export const advanceStageSchema = z.object({
  stage: z.enum(CROP_STAGES),
});

export type AdvanceStageInput = z.infer<typeof advanceStageSchema>;

export const updateTaskSchema = z.object({
  stage: z.enum(CROP_STAGES),
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid taskId"),
  status: z.enum(["pending", "done", "skipped"]),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const farmIdParamSchema = objectIdParamSchema("farmId");
export const cycleIdParamSchema = objectIdParamSchema("id");
export const cycleIdParamSchemaAlt = objectIdParamSchema("cycleId");
