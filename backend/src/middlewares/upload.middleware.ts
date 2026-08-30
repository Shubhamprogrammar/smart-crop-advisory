import multer from "multer";
import { ApiError } from "../utils/ApiError";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest("Only JPEG, PNG, or WEBP images are allowed"));
      return;
    }
    cb(null, true);
  },
});
