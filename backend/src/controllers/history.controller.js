import { chatRepository } from "../repositories/chat.repository.js";
import { success } from "../utils/apiResponse.js";

export const historyController = {
  async byDocument(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      const chats = await chatRepository.listByDocument(req.params.documentId, { page, limit });
      return success(res, 200, "Chat history fetched", chats);
    } catch (err) {
      next(err);
    }
  },

  async all(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      const chats = await chatRepository.listByOwner(req.user.id, { page, limit });
      return success(res, 200, "Chat history fetched", chats);
    } catch (err) {
      next(err);
    }
  },
};
