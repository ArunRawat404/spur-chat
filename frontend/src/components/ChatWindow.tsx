import { useEffect, useRef, useState } from "react";
import { getHistory, sendMessage, startNewChat, hasExistingSession, type Message } from "../api/chat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(hasExistingSession());
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function loadHistory() {
        try {
            const data = await getHistory();
            setMessages(data);
        } catch {
            setError("Could not load chat history");
        } finally {
            setInitialLoading(false);
        }
    }

    async function handleSend(text: string) {
        setError(null);
        setMessages((prev) => [...prev, { sender: "user", text }]);
        setLoading(true);

        try {
            const reply = await sendMessage(text);
            setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleNewChat() {
        startNewChat();
        setMessages([]);
        setError(null);
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <div style={{ fontWeight: "bold" }}>Spur Support</div>
                    <div style={{ fontSize: "12px", opacity: 0.9 }}>
                        AI-powered assistance
                    </div>
                </div>
                <button onClick={handleNewChat} style={styles.newChatButton}>
                    New Chat
                </button>
            </div>

            {/* Messages */}
            <div style={styles.messageArea}>
                {initialLoading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner} />
                        <div>Loading conversation...</div>
                    </div>
                ) : (
                    <>
                        {messages.length === 0 && !loading && (
                            <div style={styles.emptyState}>
                                <div style={{ fontSize: "24px", marginBottom: "8px" }}>👋</div>
                                <div>How can we help you today? </div>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <MessageBubble key={i} sender={m.sender} text={m.text} />
                        ))}

                        {loading && (
                            <div style={styles.typing}>Agent is typing...</div>
                        )}

                        {error && (
                            <div style={styles.error}>{error}</div>
                        )}
                    </>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={styles.inputArea}>
                <ChatInput onSend={handleSend} disabled={loading || initialLoading} />
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        width: "400px",
        height: "600px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        background: "#fff",
        overflow: "hidden",
    },
    header: {
        padding: "16px",
        background: "#2563eb",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    newChatButton: {
        background: "rgba(255,255,255,0.2)",
        border: "none",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
    },
    messageArea: {
        flex: 1,
        padding: "16px",
        overflowY: "auto",
        background: "#f8fafc",
    },
    inputArea: {
        padding: "16px",
        borderTop: "1px solid #e2e8f0",
        background: "#fff",
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#64748b",
        fontSize: "14px",
        gap: "12px",
    },
    spinner: {
        width: "24px",
        height: "24px",
        border: "3px solid #e2e8f0",
        borderTopColor: "#2563eb",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#64748b",
        fontSize: "14px",
    },
    typing: {
        fontSize: "12px",
        color: "#64748b",
        padding: "4px 0",
    },
    error: {
        color: "#dc2626",
        fontSize: "12px",
        padding: "8px",
        background: "#fef2f2",
        borderRadius: "8px",
        marginTop: "8px",
    },
};