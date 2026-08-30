import { z } from "zod";
import { SEASONS } from "../constants/enums";
import { objectIdParamSchema } from "./common.validator";

export const cropRecommendationSchema = z.object({
  // Rainfall represents the expected/typical rainfall for the growing
  // season (mm), not today's reading — a live "current precipitation"
  // value (often 0mm even in a monsoon region on a dry day) would be a
  // poor and misleading proxy for the seasonal total the model was
  // trained on, so it is always an explicit farmer input rather than
  // auto-derived from current weather.
  rainfall: z.number().min(0).max(5000),
  nitrogen: z.number().min(0).max(300).optional(),
  phosphorus: z.number().min(0).max(300).optional(),
  potassium: z.number().min(0).max(300).optional(),
  ph: z.number().min(0).max(14).optional(),
  temperature: z.number().min(-10).max(60).optional(),
  humidity: z.number().min(0).max(100).optional(),
  season: z.enum(SEASONS).optional(),
  waterAvailability: z.string().trim().max(100).optional(),
});

export type CropRecommendationInput = z.infer<typeof cropRecommendationSchema>;

export const farmIdParamSchema = objectIdParamSchema("farmId");
export const recommendationIdParamSchema = objectIdParamSchema("id");
