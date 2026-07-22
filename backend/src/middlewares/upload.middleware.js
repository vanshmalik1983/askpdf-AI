import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiResponse.js";

if (!fs.existsSync(env.uploadDir)) fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.uploadDir),
  filename: (req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`),
});

function fileFilter(req, file, cb) {
  if (file.mimetype !== "application/pdf") {
    return cb(new ApiError(415, "Only PDF files are supported"));
  }
  cb(null, true);
}

export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
}).single("file");
