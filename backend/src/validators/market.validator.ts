import { z } from "zod";
import { objectIdParamSchema } from "./common.validator";

export const cropNameParamSchema = z.object({
  cropName: z.string().trim().min(2).max(50),
});

export const marketQuerySchema = z.object({
  market: z.string().trim().max(100).optional(),
  days: z.coerce.number().int().min(3).max(90).optional(),
});

export type MarketQuery = z.infer<typeof marketQuerySchema>;

export const farmQuerySchema = z.object({
  farmId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid farmId"),
});

export const farmIdParamSchema = objectIdParamSchema("farmId");
