import type { LLMProvider } from "../../types/index.js";
import { OpenAIProvider } from "./openai.js";
import { AnthropicProvider } from "./anthropic.js";
import { GeminiProvider } from "./gemini.js";
import { config } from "../../config/index.js";

let providerInstance: LLMProvider | null = null;

export function getLLMProvider(): LLMProvider {
    if (!providerInstance) {
        switch (config.LLM_PROVIDER) {
            case "openai":
                providerInstance = new OpenAIProvider();
                break;
            case "anthropic":
                providerInstance = new AnthropicProvider();
                break;
            case "gemini":
                providerInstance = new GeminiProvider();
                break;
        }
    }
    return providerInstance;
}