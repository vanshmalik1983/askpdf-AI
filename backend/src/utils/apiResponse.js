/**
 * Uniform API envelope so every frontend call can rely on the same shape:
 * { success, message, data, error }
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function success(res, statusCode, message, data = null) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function failure(res, statusCode, message, error = null) {
  return res.status(statusCode).json({ success: false, message, error });
}
