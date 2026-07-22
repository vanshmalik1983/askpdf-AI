import User from "../models/User.js";

/**
 * Repository layer: the only place that talks to Mongoose for Users.
 * Services depend on this, never on the model directly — keeps the
 * data-access contract swappable and testable with mocks.
 */
export const userRepository = {
  findByEmail: (email, withPassword = false) => {
    const query = User.findOne({ email });
    return withPassword ? query.select("+passwordHash +refreshTokenHash") : query;
  },
  findById: (id, withSecrets = false) => {
    const query = User.findById(id);
    return withSecrets ? query.select("+passwordHash +refreshTokenHash") : query;
  },
  create: (data) => User.create(data),
  updateRefreshTokenHash: (id, hash) => User.findByIdAndUpdate(id, { refreshTokenHash: hash }),
  incrementDocumentCount: (id, delta = 1) =>
    User.findByIdAndUpdate(id, { $inc: { documentCount: delta } }),
};
