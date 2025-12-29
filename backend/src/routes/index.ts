import { Router } from "express";
import { chatRoutes } from "./chat.routes.js";
import { healthCheck } from "../controllers/chat.controller.js";

const router = Router();

router.get("/health", healthCheck);

router.use("/chat", chatRoutes);

export { router as apiRoutes };