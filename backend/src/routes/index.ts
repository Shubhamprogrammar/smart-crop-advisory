import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import farmRoutes from "./farm.routes";
import soilRoutes from "./soil.routes";
import weatherRoutes from "./weather.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/farms", farmRoutes);
router.use("/soil", soilRoutes);
router.use("/weather", weatherRoutes);

// Additional feature routers are mounted here as each phase is built.

export default router;
