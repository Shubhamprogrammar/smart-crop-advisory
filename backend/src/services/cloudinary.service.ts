import axios from "axios";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

interface UploadResult {
  publicId: string;
  format: string;
}

/**
 * Uploads with delivery type "private" (spec §9: "Prevent unauthorized
 * image access") — unlike the default "upload" type, a private asset's
 * secure_url returns 401 without a valid signature, so the raw Cloudinary
 * URL is useless on its own even if leaked. The only supported way to
 * read it back is fetchPrivateImage() below, which every image-serving
 * route in this app gates behind its own auth + ownership/case-access
 * check first.
 */
export function uploadImageBuffer(buffer: Buffer, folder: string): Promise<UploadResult> {
  if (!isCloudinaryConfigured) {
    throw ApiError.internal("Image storage is not configured on this server");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", type: "private" },
      (error, result) => {
        if (error || !result) {
          logger.error("Cloudinary upload failed", { error });
          reject(ApiError.internal("Failed to store image"));
          return;
        }
        resolve({ publicId: result.public_id, format: result.format });
      }
    );
    stream.end(buffer);
  });
}

const SIGNED_URL_TTL_SECONDS = 5 * 60;

/**
 * Fetches the image bytes server-side using a short-lived (5 min) signed
 * download URL, so the signed Cloudinary URL itself — not just the raw
 * public one — never reaches the browser; the client only ever sees our
 * own API route. private_download_url is the standard SDK feature for
 * time-limited access to a "private"-type asset (no paid token-auth
 * add-on required).
 */
export async function fetchPrivateImage(
  publicId: string,
  format: string
): Promise<{ buffer: Buffer; contentType: string }> {
  if (!isCloudinaryConfigured) {
    throw ApiError.internal("Image storage is not configured on this server");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS;
  const signedUrl = cloudinary.utils.private_download_url(publicId, format, {
    resource_type: "image",
    type: "private",
    expires_at: expiresAt,
  });

  try {
    const response = await axios.get<ArrayBuffer>(signedUrl, { responseType: "arraybuffer" });
    const contentType = (response.headers["content-type"] as string | undefined) ?? `image/${format}`;
    return { buffer: Buffer.from(response.data), contentType };
  } catch (err) {
    logger.error("Failed to fetch private image from Cloudinary", { publicId, err });
    throw ApiError.internal("Failed to load image");
  }
}
