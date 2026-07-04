import { Router } from "express";
import * as ctrl from "../controllers/admin.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

router.get("/dashboard", ctrl.dashboard as any);
router.get("/stats", ctrl.dashboard as any);
router.get("/users", ctrl.listUsers as any);
router.patch("/users/:id/role", ctrl.updateUserRole as any);
router.post("/users/:id/ban", ctrl.banUser as any);
router.post("/users/:id/suspend", ctrl.suspendUser as any);
router.post("/users/:id/restore", ctrl.restoreUser as any);
router.delete("/users/:id", ctrl.deleteUser as any);
router.get("/reports", ctrl.viewReports as any);
router.get("/ai-usage", ctrl.aiUsageStats as any);
router.get("/feedback", ctrl.listFeedback as any);
router.get("/audit-logs", ctrl.auditLogs as any);
router.get("/logs", ctrl.auditLogs as any);

export default router;

