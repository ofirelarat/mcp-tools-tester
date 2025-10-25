import React from "react";
import Chat from "./Chat";
import ToolInspector from "./ToolInspector";
import ToolRunner from "./ToolRunner";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <h1>MCP & Tools Tester</h1>
      <p>
        API: <code>http://localhost:3001</code>
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20 }}>
        <div>
          <Chat />
          <ToolRunner />
        </div>
        <div>
          <ToolInspector />
        </div>
      </div>
    </div>
  );
}
