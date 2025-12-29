import OpenAI from "openai";
import { BaseLLMProvider } from "./base.js";
import type { LLMMessage, LLMResponse } from "../../types/index.js";
import { LLMError } from "../../utils/errors.js";
import { config } from "../../config/index.js";

export class OpenAIProvider extends BaseLLMProvider {
    private readonly client: OpenAI;
    private readonly model: string;

    constructor() {
        super();
        this.model = config.OPENAI_MODEL;
        this.client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    }

    async generateReply(history: LLMMessage[], userMessage: string): Promise<LLMResponse> {
        const messages = this.buildMessages(history, this.truncateMessage(userMessage));

        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: messages.map((m) => ({ role: m.role, content: m.content })),
                max_tokens: this.maxTokens,
                temperature: 0.7,
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new LLMError("Empty response from OpenAI");
            }

            return { content };
        } catch (error) {
            if (error instanceof LLMError) throw error;
            throw new LLMError("Failed to get response from OpenAI");
        }
    }
}