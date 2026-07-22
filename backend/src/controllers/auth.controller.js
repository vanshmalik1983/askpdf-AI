import { authService } from "../services/auth.service.js";
import { success } from "../utils/apiResponse.js";

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return success(res, 201, "Account created successfully", result);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return success(res, 200, "Login successful", result);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      return success(res, 200, "Token refreshed", result);
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      await authService.logout(req.user.id);
      return success(res, 200, "Logged out successfully");
    } catch (err) {
      next(err);
    }
  },
};
