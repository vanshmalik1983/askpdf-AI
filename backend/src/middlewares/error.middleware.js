import { ApiError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

/**
 * Single place every error funnels through. Controllers/services throw
 * ApiError for expected failures (validation, not-found, auth) and let
 * anything unexpected bubble here as a generic 500 — callers never leak
 * stack traces or internal messages to the client.
 */
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, error: err.details });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Validation failed", error: err.message });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: "File exceeds the maximum allowed size" });
  }

  logger.error("Unhandled error", err);
  return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
}
