import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/auth", authRoutes);

// Additional feature routers are mounted here as each phase is built, e.g.:
// router.use("/farms", farmRoutes);

export default router;
