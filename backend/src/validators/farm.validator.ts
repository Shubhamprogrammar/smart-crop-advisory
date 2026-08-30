import { z } from "zod";
import { IRRIGATION_TYPES } from "../constants/enums";

const latLngSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const createFarmSchema = z.object({
  name: z.string().trim().min(2).max(100),
  landAreaAcres: z.number().min(0.01).max(100000),
  location: latLngSchema,
  address: z.string().trim().max(250).optional(),
  soilType: z.string().trim().max(100).optional(),
  irrigationType: z.enum(IRRIGATION_TYPES).optional(),
});

export type CreateFarmInput = z.infer<typeof createFarmSchema>;

export const updateFarmSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  landAreaAcres: z.number().min(0.01).max(100000).optional(),
  location: latLngSchema.optional(),
  address: z.string().trim().max(250).optional(),
  soilType: z.string().trim().max(100).optional(),
  irrigationType: z.enum(IRRIGATION_TYPES).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;

export const farmIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid farm id"),
});
