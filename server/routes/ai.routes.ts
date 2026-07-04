import { Router } from "express";
import * as ctrl from "../controllers/ai.controller";
import { validateBody } from "../middleware/validate.middleware";
import { authenticate, optionalAuth } from "../middleware/auth.middleware";
import { aiLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.post("/search", aiLimiter, optionalAuth, validateBody(ctrl.searchSchema), ctrl.search as any);
router.post("/recommend", aiLimiter, optionalAuth, validateBody(ctrl.searchSchema), ctrl.search as any);
router.post("/movie-to-book", aiLimiter, optionalAuth, validateBody(ctrl.movieSchema), ctrl.movieToBook as any);
router.post("/mood-to-book", aiLimiter, optionalAuth, validateBody(ctrl.moodSchema), ctrl.moodToBook as any);
router.post("/reader-personality", aiLimiter, authenticate, validateBody(ctrl.personalitySchema), ctrl.readerPersonality as any);
router.post("/personality", aiLimiter, authenticate, validateBody(ctrl.personalitySchema), ctrl.readerPersonality as any);
router.get("/books/:bookId/summary", aiLimiter, ctrl.bookSummary as any);
router.get("/books/:bookId/review", aiLimiter, ctrl.bookReview as any);
router.post("/chat", aiLimiter, authenticate, validateBody(ctrl.chatSchema), ctrl.chat as any);
router.post("/chat/stream", aiLimiter, authenticate, validateBody(ctrl.chatSchema), ctrl.chatStream as any);
router.post("/character-chat", aiLimiter, optionalAuth, validateBody(ctrl.characterChatSchema), ctrl.characterChat as any);
router.post("/quote-analysis", aiLimiter, optionalAuth, validateBody(ctrl.quoteSchema), ctrl.quoteAnalysis as any);
router.post("/pace-coach", aiLimiter, optionalAuth, validateBody(ctrl.paceSchema), ctrl.paceCoach as any);

export default router;

