import Document from "../models/Document.js";

export const documentRepository = {
  create: (data) => Document.create(data),
  findById: (id) => Document.findById(id),
  findByIdForOwner: (id, ownerId) => Document.findOne({ _id: id, owner: ownerId }),
  listByOwner: (ownerId, { page = 1, limit = 10 } = {}) =>
    Document.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  countByOwner: (ownerId) => Document.countDocuments({ owner: ownerId }),
  updateStatus: (id, status, extra = {}) =>
    Document.findByIdAndUpdate(id, { status, ...extra }, { new: true }),
  delete: (id) => Document.findByIdAndDelete(id),
};
