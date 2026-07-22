import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { failure } from "../utils/apiResponse.js";

/**
 * Verifies the short-lived access token on every protected route.
 * Deliberately does NOT hit the database — decoding the JWT is enough
 * to authorize a request, which keeps this middleware O(1) and avoids
 * a Mongo round-trip on every single API call.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return failure(res, 401, "Authentication required");
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    const message = err.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token";
    return failure(res, 401, message);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return failure(res, 403, "Admin access required");
  next();
}
