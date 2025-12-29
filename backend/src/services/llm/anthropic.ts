import Anthropic from "@anthropic-ai/sdk";
import { BaseLLMProvider } from "./base.js";
import type { LLMMessage, LLMResponse } from "../../types/index.js";
import { LLMError } from "../../utils/errors.js";
import { config } from "../../config/index.js";

export class AnthropicProvider extends BaseLLMProvider {
    private readonly client: Anthropic;
    private readonly model: string;

    constructor() {
        super();
        this.model = config.ANTHROPIC_MODEL;
        this.client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
    }

    async generateReply(history: LLMMessage[], userMessage: string): Promise<LLMResponse> {
        const messages = this.buildMessages(history, this.truncateMessage(userMessage));

        const systemContent = messages.find((m) => m.role === "system")?.content || this.systemPrompt;
        const conversationMessages = messages
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        try {
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: this.maxTokens,
                system: systemContent,
                messages: conversationMessages,
            });

            const textBlock = response.content.find((block) => block.type === "text");
            const content = textBlock?.type === "text" ? textBlock.text : null;

            if (!content) {
                throw new LLMError("Empty response from Anthropic");
            }

            return { content };
        } catch (error) {
            if (error instanceof LLMError) throw error;
            throw new LLMError("Failed to get response from Anthropic");
        }
    }
}