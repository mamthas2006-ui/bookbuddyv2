import { Router } from "express";
import * as ctrl from "../controllers/books.controller";
import { validateBody, validateQuery } from "../middleware/validate.middleware";
import { authenticate, requireRole, optionalAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", validateQuery(ctrl.listQuerySchema), optionalAuth, ctrl.list as any);
router.get("/trending", ctrl.trending as any);
router.get("/:id", optionalAuth, ctrl.getById as any);
router.get("/:id/similar", ctrl.getSimilar as any);

// Admin/moderator only
router.post("/", authenticate, requireRole("ADMIN", "MODERATOR"), validateBody(ctrl.createBookSchema), ctrl.create as any);
router.put("/:id", authenticate, requireRole("ADMIN", "MODERATOR"), ctrl.update as any);
router.patch("/:id", authenticate, requireRole("ADMIN", "MODERATOR"), ctrl.update as any);
router.delete("/:id", authenticate, requireRole("ADMIN"), ctrl.remove as any);

export default router;

