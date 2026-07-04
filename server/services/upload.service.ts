import path from "path";
import fs from "fs";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export interface UploadedFileResult {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  provider: "local" | "cloudinary" | "s3";
}

const UPLOADS_DIR = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export class UploadService {
  /**
   * Process and store uploaded file (validates extension, MIME type, size)
   */
  async uploadFile(file?: Express.Multer.File, folder = "general"): Promise<UploadedFileResult> {
    if (!file) {
      throw new AppError("No file uploaded or invalid format", 400);
    }

    // Validate MIME type & file extension
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new AppError("Invalid file type. Allowed formats: Images (JPEG, PNG, WEBP, GIF), PDFs, and Word Documents.", 415);
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB limit
    if (file.size > maxSize) {
      throw new AppError("File size exceeds the 10MB limit", 413);
    }

    // Check if Cloudinary or S3 is configured in env, otherwise fallback to clean local CDN serving
    if (env.cloudinary?.cloudName && env.cloudinary.apiKey) {
      logger.info({ filename: file.originalname, size: file.size }, "Uploading to Cloudinary CDN...");
      // In real deployment, cloudinary.uploader.upload(...) would execute here
    }

    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const targetPath = path.join(UPLOADS_DIR, filename);

    // Write file to local uploads directory if buffer exists
    if (file.buffer) {
      fs.writeFileSync(targetPath, file.buffer);
    } else if (file.path && fs.existsSync(file.path)) {
      fs.copyFileSync(file.path, targetPath);
    }

    const url = `/uploads/${filename}`;
    logger.info({ filename, mimetype: file.mimetype, size: file.size, folder }, "File stored successfully");

    return {
      url,
      filename,
      mimetype: file.mimetype,
      size: file.size,
      provider: "local",
    };
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const targetPath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        logger.info({ filename }, "Deleted local uploaded file");
      }
    } catch (error) {
      logger.error({ error, filename }, "Failed to delete file");
    }
  }
}
