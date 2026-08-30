import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import { updateProfileSchema } from "../validators/user.validator";

const router = Router();

router.use(requireAuth);

router.get("/me", catchAsync(userController.getMyProfile));
router.patch("/me", validate(updateProfileSchema), catchAsync(userController.updateMyProfile));

export default router;
