import multer from "multer";
import { AppError } from "./error.middleware";

// Store file in memory buffer first for validation and optional Cloudinary/S3 transfer
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
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

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Unsupported file type. Allowed: Images, PDF, Word documents.", 415) as unknown as null, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadSingle = (fieldName = "file") => upload.single(fieldName);
export const uploadMultiple = (fieldName = "files", maxCount = 5) => upload.array(fieldName, maxCount);
