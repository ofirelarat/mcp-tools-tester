import React, { useEffect, useState } from "react";
import api, { postSSE } from "./api";

export default function McpRunner() {
  const [mcps, setMcps] = useState([]);
  const [selectedMcp, setSelectedMcp] = useState(null);
  const [tools, setTools] = useState([]);
  const [toolName, setToolName] = useState("");
  const [input, setInput] = useState("{}");
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);

  // Load available MCPs
  useEffect(() => {
    async function loadMcps() {
      try {
        const r = await api.get("/api/mcps");
        setMcps(r.data);
      } catch (err) {
        console.error("Failed to load MCPs:", err);
      }
    }
    loadMcps();
  }, []);

  // Load tools when MCP selected
  useEffect(() => {
    if (!selectedMcp) return;
    const abortController = new AbortController();
    setTools([]);
    postSSE(
      `/api/mcps/${selectedMcp.id}`,
      {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/list",
        params: {},
      },
      (event) => {
        if (event?.result?.tools) {
          setTools(event.result.tools);
          if (event.result.tools.length) {
            setToolName(event.result.tools[0].name);
          }
        }
      },
      abortController.signal
    );

    return () => abortController.abort();
  }, [selectedMcp]);

  async function runTool() {
    if (!selectedMcp || !toolName) return;
    setRunning(true);
    setOutput([]);
    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch (err) {
      setOutput([{ type: "error", text: "Invalid JSON: " + err.message }]);
      setRunning(false);
      return;
    }

    const abortController = new AbortController();

    postSSE(
      `/api/mcps/${selectedMcp.id}`,
      {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: toolName, arguments: parsed },
      },
      (event) => {
        setOutput((prev) => [...prev, event]);
      },
      abortController.signal
    ).finally(() => setRunning(false));
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h2>🧠 MCP Runner</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select
          value={selectedMcp?.id || ""}
          onChange={(e) => {
            const mcp = mcps.find((m) => m.id === e.target.value);
            setSelectedMcp(mcp || null);
          }}
        >
          <option value="">-- Select MCP --</option>
          {mcps.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={toolName}
          onChange={(e) => setToolName(e.target.value)}
          disabled={!tools.length}
        >
          {tools.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        <button onClick={runTool} disabled={!toolName || running}>
          {running ? "Running..." : "Run"}
        </button>
      </div>

      <textarea
        style={{ width: "100%", height: 120, fontFamily: "monospace" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div style={{ marginTop: 8 }}>
        <h4>Output (SSE Stream)</h4>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#f6f6f6",
            padding: 8,
            borderRadius: 4,
            maxHeight: 300,
            overflowY: "auto",
            fontSize: 12,
          }}
        >
          {output.length === 0
            ? "No output yet"
            : output
                .map((e) => JSON.stringify(e, null, 2))
                .join("\n---\n")}
        </pre>
      </div>
    </div>
  );
}
