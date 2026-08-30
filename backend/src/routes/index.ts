import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import farmRoutes from "./farm.routes";
import soilRoutes from "./soil.routes";
import weatherRoutes from "./weather.routes";
import recommendationRoutes from "./recommendation.routes";
import cropRoutes from "./crop.routes";
import calendarRoutes from "./calendar.routes";
import diseaseRoutes from "./disease.routes";
import advisoryRoutes from "./advisory.routes";
import chatRoutes from "./chat.routes";
import knowledgeRoutes from "./knowledge.routes";
import profitRoutes from "./profit.routes";
import marketRoutes from "./market.routes";
import irrigationRoutes from "./irrigation.routes";
import notificationRoutes from "./notification.routes";
import adminRoutes from "./admin.routes";
import expertRoutes from "./expert.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/farms", farmRoutes);
router.use("/soil", soilRoutes);
router.use("/weather", weatherRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/crops", cropRoutes);
router.use("/calendar", calendarRoutes);
router.use("/diseases", diseaseRoutes);
router.use("/advisories", advisoryRoutes);
router.use("/chat", chatRoutes);
router.use("/knowledge", knowledgeRoutes);
router.use("/profit", profitRoutes);
router.use("/market", marketRoutes);
router.use("/irrigation", irrigationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/expert", expertRoutes);

// Additional feature routers are mounted here as each phase is built.

export default router;
