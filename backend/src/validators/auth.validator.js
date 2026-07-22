import { body } from "express-validator";

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

export const loginRules = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const refreshRules = [body("refreshToken").notEmpty().withMessage("Refresh token is required")];
