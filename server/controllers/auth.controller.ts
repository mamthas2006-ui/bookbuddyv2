import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { AuthService } from "../services/auth.service";
import { sendResponse } from "../utils/response";
import { STATUS_CODES } from "../constants";
import { AuthRequest } from "../types";

const authService = new AuthService();
const REFRESH_COOKIE = "refreshToken";
const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  return sendResponse(res, {
    statusCode: STATUS_CODES.CREATED,
    message: "User registered successfully",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      accessToken,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Logged in successfully",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
      accessToken,
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] || req.body.refreshToken;
  if (!token) {
    return sendResponse(res, {
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "No refresh token provided",
      data: null,
    });
  }

  const { accessToken, refreshToken, user } = await authService.refreshAccessToken(token);

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Token refreshed successfully",
    data: { accessToken, user: { id: user.id, email: user.email, role: user.role } },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] || req.body.refreshToken;
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Logged out successfully",
    data: null,
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.body.token);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Email verified successfully",
    data: { verified: true },
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "If that email exists in our system, a password reset link has been sent.",
    data: null,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Password has been reset successfully. Please log in with your new password.",
    data: null,
  });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    return sendResponse(res, { statusCode: STATUS_CODES.UNAUTHORIZED, message: "Authentication required" });
  }
  await authService.changePassword(req.user.id, req.body);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Password changed successfully",
    data: null,
  });
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Google OAuth login simulated successfully in dev environment",
    data: {
      user: { id: "google-user-id", name: "Google Reader", email: "reader@google.com", role: "USER" },
      accessToken: "mock-google-jwt-token",
    },
  });
});

export const githubAuth = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "GitHub OAuth login simulated successfully in dev environment",
    data: {
      user: { id: "github-user-id", name: "GitHub Dev Reader", email: "dev@github.com", role: "USER" },
      accessToken: "mock-github-jwt-token",
    },
  });
});

