import { ragService } from "../services/rag.service.js";
import { chatRepository } from "../repositories/chat.repository.js";
import { documentRepository } from "../repositories/document.repository.js";
import { success, failure } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiResponse.js";

export const chatController = {
  async ask(req, res, next) {
    try {
      const { documentId } = req.params;
      const { question } = req.body;

      const doc = await documentRepository.findByIdForOwner(documentId, req.user.id);
      if (!doc) return failure(res, 404, "Document not found");
      if (doc.status !== "ready") throw new ApiError(409, "Document is still processing. Try again shortly.");

      const result = await ragService.answerQuestion({ documentId, question });

      const chat = await chatRepository.create({
        owner: req.user.id,
        document: documentId,
        question,
        answer: result.answer,
        citations: result.citations,
        confidenceScore: result.confidenceScore,
        isFallback: result.isFallback,
      });

      return success(res, 200, "Answer generated", chat);
    } catch (err) {
      next(err);
    }
  },
};
