import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { requireAuth } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimiter";
import { catchAsync } from "../utils/catchAsync";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), catchAsync(authController.register));
router.post("/login", authLimiter, validate(loginSchema), catchAsync(authController.login));
router.post("/logout", authController.logout);
router.get("/me", requireAuth, catchAsync(authController.getMe));

export default router;
