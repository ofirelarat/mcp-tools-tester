import React, { useState } from "react";
import api from "./api";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "system", content: "MCP Tester local chat" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const r = await api.post("/api/chat", { messages: newMessages });
      const reply = r.data.reply;
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <h2>Chat (LLM)</h2>
      <div style={{ height: 220, overflow: "auto", padding: 8, background: "#fafafa", borderRadius: 6 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong style={{ textTransform: "capitalize" }}>{m.role}:</strong>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={{ flex: 1, padding: 8 }}
          placeholder="Type a message..."
        />
        <button onClick={send} disabled={loading}>{loading ? "..." : "Send"}</button>
      </div>
    </div>
  );
}
