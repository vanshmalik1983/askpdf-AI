import { Router } from "express";
import authRoutes from "./auth.routes.js";
import documentRoutes from "./document.routes.js";
import chatRoutes from "./chat.routes.js";
import summaryRoutes from "./summary.routes.js";
import historyRoutes from "./history.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/documents", documentRoutes);
router.use("/chat", chatRoutes);
router.use("/summary", summaryRoutes);
router.use("/history", historyRoutes);
router.use("/health", healthRoutes);

export default router;
