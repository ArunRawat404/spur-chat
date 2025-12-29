export interface Message {
    id: string;
    conversationId: string;
    sender: "user" | "ai";
    text: string;
    createdAt: Date;
}

export interface ChatResponse {
    reply: string;
    sessionId: string;
}

export interface LLMMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface LLMResponse {
    content: string;
}

export interface LLMProvider {
    generateReply(history: LLMMessage[], userMessage: string): Promise<LLMResponse>;
}