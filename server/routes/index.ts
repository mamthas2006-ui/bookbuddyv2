import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./users.routes";
import bookRoutes from "./books.routes";
import aiRoutes from "./ai.routes";
import adminRoutes from "./admin.routes";
import uploadRoutes from "./upload.routes";
import healthRoutes from "./health.routes";

const router = Router();

// Mount Health APIs
router.use("/", healthRoutes);

// Mount core modules
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/books", bookRoutes);
router.use("/ai", aiRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);

export default router;

