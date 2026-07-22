import { summaryService } from "../services/summary.service.js";
import { success } from "../utils/apiResponse.js";

export const summaryController = {
  async request(req, res, next) {
    try {
      const result = await summaryService.requestSummary(req.params.documentId, req.user.id);
      return success(res, 202, "Summary generation started", result);
    } catch (err) {
      next(err);
    }
  },

  async get(req, res, next) {
    try {
      const summary = await summaryService.getSummary(req.params.documentId, req.user.id);
      return success(res, 200, "Summary fetched", summary);
    } catch (err) {
      next(err);
    }
  },
};
