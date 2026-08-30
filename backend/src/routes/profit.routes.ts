import { Router } from "express";
import * as profitController from "../controllers/profit.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { profitCalculatorSchema } from "../validators/profit.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("farmer"));

router.post("/calculate", validate(profitCalculatorSchema), profitController.calculate);

export default router;
