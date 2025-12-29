import ChatWindow from "./components/ChatWindow";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
        padding: "20px",
      }}
    >
      <ChatWindow />
    </div>
  );
}