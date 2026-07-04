import { Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { AuthRequest } from "../types";
import { sendResponse } from "../utils/response";
import { UploadService } from "../services/upload.service";
import { prisma } from "../config/prisma";
import { STATUS_CODES } from "../constants";

const uploadService = new UploadService();

export const uploadFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = req.file;
  const result = await uploadService.uploadFile(file, "general");

  return sendResponse(res, {
    statusCode: STATUS_CODES.CREATED,
    message: "File uploaded successfully",
    data: result,
  });
});

export const uploadMultipleFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    return sendResponse(res, {
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "No files uploaded",
      data: null,
    });
  }

  const results = await Promise.all(files.map((file) => uploadService.uploadFile(file, "general")));

  return sendResponse(res, {
    statusCode: STATUS_CODES.CREATED,
    message: "Files uploaded successfully",
    data: results,
  });
});

export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return sendResponse(res, { statusCode: STATUS_CODES.UNAUTHORIZED, message: "Authentication required" });
  }

  const file = req.file;
  const result = await uploadService.uploadFile(file, "avatars");

  // Update avatarUrl in User model
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatarUrl: result.url },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Profile picture uploaded and updated successfully",
    data: { user, file: result },
  });
});

export const deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { filename } = req.params;
  await uploadService.deleteFile(filename);

  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "File deleted successfully",
    data: null,
  });
});
