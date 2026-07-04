import { Router } from "express";
import * as ctrl from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth.middleware";
import { uploadSingle, uploadMultiple } from "../middleware/upload.middleware";

const router = Router();

router.use(authenticate);

router.post("/", uploadSingle("file"), ctrl.uploadFile as any);
router.post("/single", uploadSingle("file"), ctrl.uploadFile as any);
router.post("/multiple", uploadMultiple("files", 10), ctrl.uploadMultipleFiles as any);
router.post("/avatar", uploadSingle("avatar"), ctrl.uploadAvatar as any);
router.delete("/:filename", ctrl.deleteFile as any);

export default router;
