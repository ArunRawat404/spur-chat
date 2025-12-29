import { useState } from "react";

type Props = {
    onSend: (text: string) => void;
    disabled: boolean;
};

export default function ChatInput({ onSend, disabled }: Props) {
    const [text, setText] = useState("");

    function handleSend() {
        if (!text.trim() || disabled) return;
        onSend(text.trim());
        setText("");
    }

    return (
        <div style={{ display: "flex", gap: "8px" }}>
            <input
                value={text}
                disabled={disabled}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    outline: "none",
                }}
            />
            <button
                disabled={disabled || !text.trim()}
                onClick={handleSend}
                style={{
                    padding: "0 20px",
                    borderRadius: "8px",
                    background: disabled || !text.trim() ? "#94a3b8" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    cursor: disabled || !text.trim() ? "not-allowed" : "pointer",
                    fontSize: "14px",
                }}
            >
                Send
            </button>
        </div>
    );
}