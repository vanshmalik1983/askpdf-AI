import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { registerRules, loginRules, refreshRules } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, registerRules, validate, authController.register);
router.post("/login", authLimiter, loginRules, validate, authController.login);
router.post("/refresh", authLimiter, refreshRules, validate, authController.refresh);
router.post("/logout", requireAuth, authController.logout);

export default router;
