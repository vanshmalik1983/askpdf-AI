import Chat from "../models/Chat.js";

export const chatRepository = {
  create: (data) => Chat.create(data),
  listByDocument: (documentId, { page = 1, limit = 20 } = {}) =>
    Chat.find({ document: documentId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  listByOwner: (ownerId, { page = 1, limit = 20 } = {}) =>
    Chat.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("document", "originalName"),
};
