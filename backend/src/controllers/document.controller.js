import { documentService } from "../services/document.service.js";
import { success, failure } from "../utils/apiResponse.js";

export const documentController = {
  async upload(req, res, next) {
    try {
      if (!req.file) return failure(res, 400, "No file uploaded");
      const doc = await documentService.uploadDocument({ ownerId: req.user.id, file: req.file });
      return success(res, 202, "Document uploaded and queued for processing", doc);
    } catch (err) {
      next(err);
    }
  },

  async getStatus(req, res, next) {
    try {
      const status = await documentService.getStatus(req.params.documentId, req.user.id);
      return success(res, 200, "Document status fetched", status);
    } catch (err) {
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const result = await documentService.listDocuments(req.user.id, { page, limit });
      return success(res, 200, "Documents fetched", result);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await documentService.deleteDocument(req.params.documentId, req.user.id);
      return success(res, 200, "Document deleted");
    } catch (err) {
      next(err);
    }
  },
};
