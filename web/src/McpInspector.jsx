import React, { useEffect, useState } from "react";
import api, { postSSE } from "./api";

export default function McpInspector() {
  const [mcps, setMcps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tools, setTools] = useState([]);
  const [logs, setLogs] = useState([]);

  async function load() {
    const r = await api.get("/api/mcps");
    setMcps(r.data);
  }

  useEffect(async () => {
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const abortController = new AbortController();

    postSSE(
      `/api/mcps/${selected.id}`,
      {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/list",
        params: {},
      },
      (event) => {
        setTools((prev) => [...prev, ...event?.result?.tools]);
      },
      abortController.signal
    );

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [selected]);

  async function connectMcp(mcp) {
    setTools([]);
    setSelected(mcp);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🧠 MCP Inspector</h1>

      <div>
        <label className="font-semibold mr-2">Select MCP:</label>
        <select
          onChange={(e) => {
            const mcp = mcps.find((x) => x.id === e.target.value);
            if (mcp) {
              connectMcp(mcp);
            }
          }}
          className="border rounded p-1"
        >
          <option value="">-- Choose MCP --</option>
          {mcps.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          <h2 className="text-xl font-semibold">Available Tools</h2>
          <ul className="space-y-2">
            {tools.map((t) => (
              <li key={t.name} className="border p-2 rounded">
                <strong>{t.name}</strong> — {t.description}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mt-6">SSE Logs</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">
            {logs.map((l, i) => (
              <div key={i}>{JSON.stringify(l)}</div>
            ))}
          </pre>
        </>
      )}
    </div>
  );
}
