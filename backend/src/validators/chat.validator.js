import { body, param } from "express-validator";

export const askQuestionRules = [
  param("documentId").isMongoId().withMessage("Invalid document id"),
  body("question")
    .trim()
    .notEmpty()
    .withMessage("Question is required")
    .isLength({ max: 500 })
    .withMessage("Question is too long (max 500 characters)"),
];
