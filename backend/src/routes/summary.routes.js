import { Router } from "express";
import { summaryController } from "../controllers/summary.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { documentIdRules } from "../validators/document.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.use(requireAuth);
router.post("/:documentId", documentIdRules, validate, summaryController.request);
router.get("/:documentId", documentIdRules, validate, summaryController.get);

export default router;
