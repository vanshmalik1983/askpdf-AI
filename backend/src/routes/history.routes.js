import { Router } from "express";
import { historyController } from "../controllers/history.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { documentIdRules, paginationRules } from "../validators/document.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/:documentId", documentIdRules, paginationRules, validate, historyController.byDocument);
router.get("/", paginationRules, validate, historyController.all);

export default router;
