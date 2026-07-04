import { Router } from "express";
import * as ctrl from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validate.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";
import { authenticate } from "../middleware/auth.middleware";
import * as val from "../validation/auth.validation";

const router = Router();

router.post("/register", authLimiter, validateRequest(val.registerSchema), ctrl.signup);
router.post("/signup", authLimiter, validateRequest(val.registerSchema), ctrl.signup);
router.post("/login", authLimiter, validateRequest(val.loginSchema), ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
router.post("/verify-email", validateRequest(val.verifyEmailSchema), ctrl.verifyEmail);
router.post("/forgot-password", authLimiter, validateRequest(val.forgotPasswordSchema), ctrl.forgotPassword);
router.post("/reset-password", authLimiter, validateRequest(val.resetPasswordSchema), ctrl.resetPassword);
router.post("/change-password", authenticate, validateRequest(val.changePasswordSchema), ctrl.changePassword as any);
router.post("/google", ctrl.googleAuth);
router.post("/github", ctrl.githubAuth);

export default router;

