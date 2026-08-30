import { z } from "zod";
import { ROLES, SEASONS } from "../constants/enums";
import { objectIdParamSchema } from "./common.validator";

// --- Users -----------------------------------------------------------------

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  role: z.enum(ROLES).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  isActive: z.coerce.boolean().optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const updateUserSchema = z
  .object({
    role: z.enum(ROLES).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.role !== undefined || data.isActive !== undefined, {
    message: "Provide at least one of role or isActive",
  });
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userIdParamSchema = objectIdParamSchema("id");

// --- Crops -------------------------------------------------------------

const rangeSchema = z.object({ min: z.number().optional(), max: z.number().optional() }).optional();

export const createCropSchema = z.object({
  name: z.string().trim().min(2).max(60),
  localNames: z
    .object({
      hi: z.string().trim().max(60).optional(),
      mr: z.string().trim().max(60).optional(),
      gu: z.string().trim().max(60).optional(),
    })
    .optional(),
  category: z.string().trim().max(60).optional(),
  seasons: z.array(z.enum(SEASONS)).optional(),
  idealN: rangeSchema,
  idealP: rangeSchema,
  idealK: rangeSchema,
  idealPh: rangeSchema,
  idealTemperature: rangeSchema,
  idealRainfall: rangeSchema,
  growthDurationDays: z.number().int().min(1).optional(),
  diseaseDetectionSupported: z.boolean().optional(),
  imageUrl: z.string().trim().url().optional(),
});
export type CreateCropInput = z.infer<typeof createCropSchema>;

export const updateCropSchema = createCropSchema.partial();
export type UpdateCropInput = z.infer<typeof updateCropSchema>;

export const cropIdParamSchema = objectIdParamSchema("id");

// --- Advisories --------------------------------------------------------

export const listAdvisoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["active", "acknowledged", "dismissed", "expired"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});
export type ListAdvisoriesQuery = z.infer<typeof listAdvisoriesQuerySchema>;

// --- Disease detections --------------------------------------------------

export const listDiseaseDetectionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  severity: z.enum(["low", "medium", "high"]).optional(),
});
export type ListDiseaseDetectionsQuery = z.infer<typeof listDiseaseDetectionsQuerySchema>;

// --- Advisory rule thresholds ---------------------------------------------

export const updateRuleThresholdsSchema = z
  .object({
    heavyRainProbability: z.number().min(0).max(100).optional(),
    heavyRainMm: z.number().min(0).optional(),
    strongWindKmh: z.number().min(0).optional(),
    heatStressC: z.number().optional(),
    coldStressC: z.number().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "Provide at least one threshold to update" });
export type UpdateRuleThresholdsInput = z.infer<typeof updateRuleThresholdsSchema>;
