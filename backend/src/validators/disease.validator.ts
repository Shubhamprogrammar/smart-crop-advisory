import { z } from "zod";
import { SUPPORTED_DISEASE_CROPS } from "../constants/enums";
import { objectIdParamSchema } from "./common.validator";

export const detectDiseaseBodySchema = z.object({
  cropType: z.enum(SUPPORTED_DISEASE_CROPS).optional(),
});

export type DetectDiseaseInput = z.infer<typeof detectDiseaseBodySchema>;

export const farmIdParamSchema = objectIdParamSchema("farmId");
export const detectionIdParamSchema = objectIdParamSchema("id");
