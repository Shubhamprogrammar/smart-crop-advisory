import { Router } from "express";
import * as expertController from "../controllers/expert.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import {
  createCaseSchema,
  listCasesQuerySchema,
  caseIdParamSchema,
  addResponseSchema,
  updateCaseStatusSchema,
} from "../validators/expert.validator";

const router = Router();

router.use(requireAuth);

router.post(
  "/cases",
  requireRole("farmer"),
  validate(createCaseSchema),
  catchAsync(expertController.createCase)
);

router.get(
  "/cases",
  requireRole("farmer", "expert", "admin"),
  validate(listCasesQuerySchema, "query"),
  catchAsync(expertController.listCases)
);

router.get(
  "/cases/:id",
  requireRole("farmer", "expert", "admin"),
  validate(caseIdParamSchema, "params"),
  catchAsync(expertController.getCaseDetail)
);

router.patch(
  "/cases/:id/assign",
  requireRole("expert"),
  validate(caseIdParamSchema, "params"),
  catchAsync(expertController.assignCase)
);

router.post(
  "/cases/:id/responses",
  requireRole("expert"),
  validate(caseIdParamSchema, "params"),
  validate(addResponseSchema),
  catchAsync(expertController.addResponse)
);

router.patch(
  "/cases/:id/status",
  requireRole("expert", "admin"),
  validate(caseIdParamSchema, "params"),
  validate(updateCaseStatusSchema),
  catchAsync(expertController.updateCaseStatus)
);

export default router;
