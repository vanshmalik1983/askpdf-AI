import { Router } from "express";
import { documentController } from "../controllers/document.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { uploadPdf } from "../middlewares/upload.middleware.js";
import { documentIdRules, paginationRules } from "../validators/document.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.use(requireAuth);
router.post("/", uploadPdf, documentController.upload);
router.get("/", paginationRules, validate, documentController.list);
router.get("/:documentId/status", documentIdRules, validate, documentController.getStatus);
router.delete("/:documentId", documentIdRules, validate, documentController.remove);

export default router;
