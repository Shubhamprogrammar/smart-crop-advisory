import { z } from "zod";
import { objectIdParamSchema } from "./common.validator";

export const manualSoilEntrySchema = z
  .object({
    nitrogen: z.number().min(0).optional(),
    phosphorus: z.number().min(0).optional(),
    potassium: z.number().min(0).optional(),
    ph: z.number().min(0).max(14).optional(),
    organicCarbon: z.number().min(0).optional(),
    moisture: z.number().min(0).max(100).optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    "At least one soil parameter is required"
  );

export type ManualSoilEntryInput = z.infer<typeof manualSoilEntrySchema>;

export const farmIdParamSchema = objectIdParamSchema("farmId");
export const soilReportIdParamSchema = objectIdParamSchema("reportId");
