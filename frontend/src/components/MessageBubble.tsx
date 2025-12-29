type Props = {
    sender: "user" | "ai";
    text: string;
};

export default function MessageBubble({ sender, text }: Props) {
    const isUser = sender === "user";

    return (
        <div
            style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                marginBottom: "12px",
            }}
        >
            <div
                style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isUser ? "#2563eb" : "#fff",
                    color: isUser ? "#fff" : "#1e293b",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    lineHeight: "1.5",
                    fontSize: "14px",
                }}
            >
                {text}
            </div>
        </div>
    );
}