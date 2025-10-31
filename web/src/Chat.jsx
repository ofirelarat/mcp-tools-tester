import React, { useState, useRef, useEffect } from "react";
import api, { postSSE } from "./api";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "system", content: "MCP Tester local chat" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState("gpt-4");

  const containerRef = useRef();

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantMsg = { role: "assistant", content: "" };
    setMessages((m) => [...m, assistantMsg]);

    try {
      await postSSE(
        "/api/chat",
        { messages: newMessages, provider, modelId, apiKey, stream: true },
        (event) => {
          setMessages((m) => {
            const updated = [...m];
            const lastIndex = updated.findIndex((msg) => msg === assistantMsg);
            if (lastIndex >= 0) {
              updated[lastIndex] = {
                ...assistantMsg,
                content:
                  updated[lastIndex].content +
                  (event.delta || event.result || ""),
              };
            }
            return updated;
          });
        }
      );
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        maxWidth: 600,
      }}
    >
      <h2 style={{ marginBottom: 8 }}>Chat (LLM + MCP Tools)</h2>

      {/* Provider & API Key */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          style={{ padding: 8, borderRadius: 4 }}
        >
          <option value="openai">OpenAI</option>
          <option value="claude">Claude</option>
          <option value="ollama">Ollama</option>
        </select>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API Key"
          style={{ flex: 1, padding: 8, borderRadius: 4 }}
        />
      </div>

      {/* Chat messages */}
      <div
        ref={containerRef}
        style={{
          height: 300,
          overflow: "auto",
          padding: 8,
          background: "#fafafa",
          borderRadius: 6,
          marginBottom: 8,
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong style={{ textTransform: "capitalize" }}>{m.role}:</strong>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 8, borderRadius: 4 }}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !apiKey}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            backgroundColor: loading || !apiKey ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            cursor: loading || !apiKey ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
