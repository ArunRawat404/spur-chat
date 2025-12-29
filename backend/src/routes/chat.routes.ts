import { Router } from "express";
import { z } from "zod";
import { sendMessage, getHistory } from "../controllers/chat.controller.js";
import { validateBody } from "../middleware/validation.js";

const router = Router();

const messageSchema = z.object({
    message: z.string().min(1, "Message is required").max(4000, "Message too long"),
    sessionId: z.string().uuid().optional(),
});

router.post("/message", validateBody(messageSchema), sendMessage);

// Single history endpoint - handles both /history and /history/: sessionId
router.get("/history/:sessionId?", getHistory);

export { router as chatRoutes };