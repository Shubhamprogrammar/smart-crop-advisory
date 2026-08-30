import { z } from "zod";
import { objectIdParamSchema } from "./common.validator";

export const farmIdParamSchema = objectIdParamSchema("farmId");
export const advisoryIdParamSchema = objectIdParamSchema("id");

export const updateAdvisoryStatusSchema = z.object({
  status: z.enum(["acknowledged", "dismissed"]),
});

export type UpdateAdvisoryStatusInput = z.infer<typeof updateAdvisoryStatusSchema>;
