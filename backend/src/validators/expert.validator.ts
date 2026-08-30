import { z } from "zod";
import { PRIORITY_LEVELS } from "../constants/enums";
import { objectIdParamSchema } from "./common.validator";

export const createCaseSchema = z.object({
  farmId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid farmId"),
  cropCycleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid cropCycleId").optional(),
  diseaseDetectionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid diseaseDetectionId").optional(),
  subject: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(2000),
  priority: z.enum(PRIORITY_LEVELS).optional(),
});
export type CreateCaseInput = z.infer<typeof createCaseSchema>;

export const listCasesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["open", "assigned", "in_progress", "resolved", "closed"]).optional(),
  assignedToMe: z.coerce.boolean().optional(),
});
export type ListCasesQuery = z.infer<typeof listCasesQuerySchema>;

export const caseIdParamSchema = objectIdParamSchema("id");

export const addResponseSchema = z.object({
  message: z.string().trim().min(2).max(2000),
  recommendation: z.string().trim().max(2000).optional(),
});
export type AddResponseInput = z.infer<typeof addResponseSchema>;

export const updateCaseStatusSchema = z.object({
  status: z.enum(["resolved", "closed"]),
});
export type UpdateCaseStatusInput = z.infer<typeof updateCaseStatusSchema>;
