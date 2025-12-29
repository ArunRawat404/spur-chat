import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseLLMProvider } from "./base.js";
import type { LLMMessage, LLMResponse } from "../../types/index.js";
import { LLMError } from "../../utils/errors.js";
import { config } from "../../config/index.js";

export class GeminiProvider extends BaseLLMProvider {
    private readonly client: GoogleGenerativeAI;
    private readonly model: string;

    constructor() {
        super();
        this.model = config.GEMINI_MODEL;
        this.client = new GoogleGenerativeAI(config.GEMINI_API_KEY!);
    }

    async generateReply(history: LLMMessage[], userMessage: string): Promise<LLMResponse> {
        const truncatedMessage = this.truncateMessage(userMessage);
        const messages = this.buildMessages(history, truncatedMessage);

        const systemInstruction = messages.find((m) => m.role === "system")?.content || this.systemPrompt;
        const geminiHistory = messages
            .filter((m) => m.role !== "system")
            .slice(0, -1)
            .map((m) => ({
                role: m.role === "assistant" ? "model" as const : "user" as const,
                parts: [{ text: m.content }],
            }));

        try {
            const model = this.client.getGenerativeModel({
                model: this.model,
                systemInstruction,
                generationConfig: {
                    maxOutputTokens: this.maxTokens,
                    temperature: 0.7,
                },
            });

            const chat = model.startChat({ history: geminiHistory });
            const result = await chat.sendMessage(truncatedMessage);
            const content = result.response.text();

            if (!content) {
                throw new LLMError("Empty response from Gemini");
            }

            return { content };
        } catch (error) {
            if (error instanceof LLMError) throw error;
            throw new LLMError("Failed to get response from Gemini");
        }
    }
}