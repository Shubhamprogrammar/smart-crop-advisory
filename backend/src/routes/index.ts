import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import farmRoutes from "./farm.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/farms", farmRoutes);

// Additional feature routers are mounted here as each phase is built.

export default router;
