import { Router } from "express";
import * as ctrl from "../controllers/health.controller";
import * as qaCtrl from "../controllers/qa.controller";

const router = Router();

router.get("/health", ctrl.checkHealth as any);
router.get("/health/qa-suite", qaCtrl.runQASuite as any);
router.get("/metrics", ctrl.getMetrics as any);
router.get("/version", ctrl.getVersion as any);
router.get("/qa-suite", qaCtrl.runQASuite as any);
router.get("/", ctrl.checkHealth as any);

export default router;
