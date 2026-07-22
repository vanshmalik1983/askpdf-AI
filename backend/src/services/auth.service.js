import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/apiResponse.js";
import { env } from "../config/env.js";

const SALT_ROUNDS = 12; // 12 balances brute-force resistance against login latency (~250ms on typical hardware)

function signAccessToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiry,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user._id }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiry });
}

export const authService = {
  async register({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ApiError(409, "An account with this email already exists");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ name, email, passwordHash });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await userRepository.updateRefreshTokenHash(user._id, await bcrypt.hash(refreshToken, 10));

    return { user: { id: user._id, name: user.name, email: user.email }, accessToken, refreshToken };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) throw new ApiError(401, "Invalid email or password");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid email or password");

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await userRepository.updateRefreshTokenHash(user._id, await bcrypt.hash(refreshToken, 10));

    return { user: { id: user._id, name: user.name, email: user.email }, accessToken, refreshToken };
  },

  /**
   * Refresh-token rotation: every refresh issues a NEW refresh token and
   * invalidates the old one (by overwriting its stored hash). If a stolen
   * refresh token is replayed after the legitimate user has already
   * refreshed, the hash comparison fails and the session is killed —
   * this bounds the damage window of a leaked refresh token.
   */
  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await userRepository.findById(payload.sub, true);
    if (!user || !user.refreshTokenHash) throw new ApiError(401, "Session no longer valid");

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new ApiError(401, "Session no longer valid");

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    await userRepository.updateRefreshTokenHash(user._id, await bcrypt.hash(newRefreshToken, 10));

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(userId) {
    await userRepository.updateRefreshTokenHash(userId, null);
  },
};
