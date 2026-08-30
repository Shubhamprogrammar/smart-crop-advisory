import { Router } from "express";
import * as knowledgeController from "../controllers/knowledge.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import {
  createKnowledgeDocumentSchema,
  knowledgeDocumentIdParamSchema,
} from "../validators/knowledge.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.post("/", validate(createKnowledgeDocumentSchema), catchAsync(knowledgeController.createDocument));
router.get("/", catchAsync(knowledgeController.listDocuments));
router.delete(
  "/:id",
  validate(knowledgeDocumentIdParamSchema, "params"),
  catchAsync(knowledgeController.deleteDocument)
);

export default router;
