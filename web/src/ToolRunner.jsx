import React, { useState, useEffect } from "react";
import api from "./api";

export default function ToolRunner() {
  const [tools, setTools] = useState([]);
  const [toolId, setToolId] = useState("");
  const [input, setInput] = useState("{}");
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api.get("/api/tools").then(r => {
      setTools(r.data);
      if (r.data.length) setToolId(r.data[0].id);
    }).catch(console.error);
  }, []);

  async function run() {
    setRunning(true);
    setOutput(null);
    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch (err) {
      setOutput({ error: "Invalid JSON input: " + err.message });
      setRunning(false);
      return;
    }
    try {
      const r = await api.post(`/api/tools/${toolId}/run`, parsed);
      setOutput(r.data);
    } catch (err) {
      setOutput({ error: err.message, details: err.response?.data });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h2>Tool Runner</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select value={toolId} onChange={(e) => setToolId(e.target.value)}>
          {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button onClick={run} disabled={!toolId || running}>{running ? "Running..." : "Run"}</button>
      </div>
      <textarea
        style={{ width: "100%", height: 120, fontFamily: "monospace" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div style={{ marginTop: 8 }}>
        <h4>Output</h4>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(output, null, 2)}</pre>
      </div>
    </div>
  );
}
