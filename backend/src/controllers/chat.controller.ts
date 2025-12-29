import type { Request, Response, NextFunction } from "express";
import { chatService } from "../services/chat.service.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("controller: chat");

export interface MessageRequestBody {
    message: string;
    sessionId?: string;
}

export async function sendMessage(
    req: Request<unknown, unknown, MessageRequestBody>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { message, sessionId } = req.body;

        logger.debug("Received chat message", { sessionId, messageLength: message.length });

        const response = await chatService.processMessage(message, sessionId);

        res.json({
            success: true,
            data: response,
        });
    } catch (error) {
        next(error);
    }
}

export async function getHistory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const sessionId = req.params.sessionId || (req.query.sessionId as string);

        // No sessionId - return empty history
        if (!sessionId) {
            res.json({
                success: true,
                data: { sessionId: null, messages: [] },
            });
            return;
        }

        logger.debug("Fetching conversation history", { sessionId });

        const messages = await chatService.getConversationHistory(sessionId);

        res.json({
            success: true,
            data: { sessionId, messages },
        });
    } catch (error) {
        next(error);
    }
}

export async function healthCheck(_req: Request, res: Response): Promise<void> {
    res.json({
        success: true,
        data: { status: "healthy", timestamp: new Date().toISOString() },
    });
}