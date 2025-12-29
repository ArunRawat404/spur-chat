import { conversationRepository } from "../repositories/conversation.repository.js";
import { getLLMProvider } from "./llm/factory.js";
import type { ChatResponse, LLMMessage, Message } from "../types/index.js";
import { ValidationError } from "../utils/errors.js";
import { ERROR_MESSAGES } from "../config/prompts.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("chat");

export class ChatService {
    async processMessage(message: string, sessionId?: string): Promise<ChatResponse> {
        if (!message || message.trim().length === 0) {
            throw new ValidationError("Message cannot be empty");
        }

        const conversationId = sessionId && await conversationRepository.exists(sessionId)
            ? sessionId
            : (await conversationRepository.create()).id;

        await conversationRepository.addMessage(conversationId, "user", message);

        const history = await this.getFormattedHistory(conversationId);
        const aiResponse = await this.generateAIResponse(history, message);

        await conversationRepository.addMessage(conversationId, "ai", aiResponse);

        return { reply: aiResponse, sessionId: conversationId };
    }

    async getConversationHistory(sessionId: string): Promise<Message[]> {
        if (!await conversationRepository.exists(sessionId)) {
            return [];
        }
        return conversationRepository.getMessages(sessionId);
    }

    private async getFormattedHistory(conversationId: string): Promise<LLMMessage[]> {
        const messages = await conversationRepository.getMessages(conversationId);
        return messages.slice(0, -1).map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant" as const,
            content: msg.text,
        }));
    }

    private async generateAIResponse(history: LLMMessage[], userMessage: string): Promise<string> {
        try {
            const provider = getLLMProvider();
            const response = await provider.generateReply(history, userMessage);
            return response.content;
        } catch (error) {
            logger.error("LLM error", error);
            return ERROR_MESSAGES.LLM_UNAVAILABLE;
        }
    }
}

export const chatService = new ChatService();