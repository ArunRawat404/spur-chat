import type { LLMProvider, LLMMessage, LLMResponse } from "../../types/index.js";
import { SYSTEM_PROMPT } from "../../config/prompts.js";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 20;

export abstract class BaseLLMProvider implements LLMProvider {
    protected readonly systemPrompt = SYSTEM_PROMPT;
    protected readonly maxTokens = 1000;

    abstract generateReply(history: LLMMessage[], userMessage: string): Promise<LLMResponse>;

    protected buildMessages(history: LLMMessage[], userMessage: string): LLMMessage[] {
        return [
            { role: "system", content: this.systemPrompt },
            ...history.slice(-MAX_HISTORY_MESSAGES),
            { role: "user", content: userMessage },
        ];
    }

    protected truncateMessage(message: string): string {
        if (message.length <= MAX_MESSAGE_LENGTH) {
            return message;
        }
        return message.slice(0, MAX_MESSAGE_LENGTH) + "...  [truncated]";
    }
}