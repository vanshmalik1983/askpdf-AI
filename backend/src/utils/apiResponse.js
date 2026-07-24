/**
 * Standardized API response utilities.
 *
 * All API responses follow the same structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data?: object,
 *   error?: object
 * }
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Send a successful API response.
 */
export function success(res, statusCode = 200, message, data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send a failed API response.
 */
export function failure(res, statusCode = 500, message, error = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
}