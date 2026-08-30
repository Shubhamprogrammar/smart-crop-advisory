import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

interface UploadResult {
  url: string;
  publicId: string;
}

export function uploadImageBuffer(buffer: Buffer, folder: string): Promise<UploadResult> {
  if (!isCloudinaryConfigured) {
    throw ApiError.internal("Image storage is not configured on this server");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          logger.error("Cloudinary upload failed", { error });
          reject(ApiError.internal("Failed to store image"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}
