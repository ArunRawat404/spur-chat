const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1/chat";
const SESSION_KEY = "chat_session_id";

export interface Message {
    sender: "user" | "ai";
    text: string;
}

export function getSessionId(): string | null {
    return localStorage.getItem(SESSION_KEY);
}

function setSessionId(sessionId: string | null): void {
    if (sessionId) {
        localStorage.setItem(SESSION_KEY, sessionId);
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

export async function sendMessage(message: string): Promise<string> {
    const sessionId = getSessionId();

    const res = await fetch(`${BASE_URL}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, ...(sessionId && { sessionId }) }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error?.message || "Failed to send message");
    }

    const data = await res.json();
    setSessionId(data.data.sessionId);

    return data.data.reply;
}

export async function getHistory(): Promise<Message[]> {
    const sessionId = getSessionId();

    if (!sessionId) {
        return [];
    }

    const res = await fetch(`${BASE_URL}/history/${sessionId}`);

    if (res.status === 404) {
        setSessionId(null);
        return [];
    }

    if (!res.ok) {
        throw new Error("Failed to load history");
    }

    const data = await res.json();
    return data.data.messages.map((m: { sender: string; text: string }) => ({
        sender: m.sender,
        text: m.text,
    }));
}

export function startNewChat(): void {
    setSessionId(null);
}

// Check if there's a session without making API call
export function hasExistingSession(): boolean {
    return getSessionId() !== null;
}