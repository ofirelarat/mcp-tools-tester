import React, { useEffect, useState } from "react";
import api from "./api";

export default function ToolInspector() {
  const [tools, setTools] = useState([]);
  const [selected, setSelected] = useState(null);

  async function load() {
    const r = await api.get("/api/tools");
    setTools(r.data.tools); // unwrap tools
    if (r.data.tools.length && !selected) setSelected(r.data.tools[0].id);
  }

  useEffect(() => {
    load();
  }, []);

  const selectedTool = tools.find((t) => t.id === selected);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h2>Tools Inspector</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <select
          value={selected || ""}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">-- select a tool --</option>
          {tools.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button onClick={load}>Reload</button>
      </div>
      <div style={{ marginTop: 12 }}>
        {selectedTool ? (
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(selectedTool, null, 2)}
          </pre>
        ) : (
          <div>No tool selected</div>
        )}
      </div>
    </div>
  );
}
