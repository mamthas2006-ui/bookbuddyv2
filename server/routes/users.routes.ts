import { Router } from "express";
import * as ctrl from "../controllers/users.controller";
import * as uploadCtrl from "../controllers/upload.controller";
import { validateBody } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { uploadSingle } from "../middleware/upload.middleware";

const router = Router();

router.use(authenticate); // every route below requires a logged-in user

router.get("/", ctrl.listUsers as any);
router.get("/me", ctrl.getMe as any);
router.get("/me/library", ctrl.getLibrary as any);
router.get("/me/achievements", ctrl.getAchievements as any);
router.patch("/me/profile", validateBody(ctrl.updateProfileSchema), ctrl.updateProfile as any);
router.put("/me/profile", validateBody(ctrl.updateProfileSchema), ctrl.updateProfile as any);
router.post("/me/avatar", uploadSingle("avatar"), uploadCtrl.uploadAvatar as any);
router.delete("/me", ctrl.deleteAccount as any);

router.post("/me/favorites/:bookId", ctrl.toggleFavorite as any);
router.post("/me/bookmarks/:bookId", ctrl.toggleBookmark as any);
router.post("/me/reading-progress", validateBody(ctrl.readingProgressSchema), ctrl.updateReadingProgress as any);

router.get("/:id", ctrl.getUserById as any);

export default router;

