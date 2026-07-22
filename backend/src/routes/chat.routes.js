import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { askQuestionRules } from "../validators/chat.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { chatLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.use(requireAuth);
router.post("/:documentId/ask", chatLimiter, askQuestionRules, validate, chatController.ask);

export default router;
