import { validationResult } from "express-validator";
import { failure } from "../utils/apiResponse.js";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return failure(res, 400, "Validation failed", errors.array());
  }
  next();
}
