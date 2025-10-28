import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate} from "react-router-dom";
import Chat from "./Chat";
import ToolInspector from "./ToolInspector";
import ToolRunner from "./ToolRunner";
import McpInspector from "./McpInspector";

export default function App() {
  return (
    <Router>
      <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
        <h1>MCP & Tools Tester</h1>
        <p>
          API: <code>http://localhost:5174</code>
        </p>

        {/* Navigation Bar */}
        <nav style={{ marginBottom: 20, display: "flex", gap: 16 }}>
          <NavLink
            to="/chat"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: isActive ? "#0070f3" : "#333",
              fontWeight: isActive ? "bold" : "normal",
            })}
          >
            💬 Chat
          </NavLink>

          <NavLink
            to="/tools"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: isActive ? "#0070f3" : "#333",
              fontWeight: isActive ? "bold" : "normal",
            })}
          >
            🧰 Tools
          </NavLink>

          <NavLink
            to="/mcp"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: isActive ? "#0070f3" : "#333",
              fontWeight: isActive ? "bold" : "normal",
            })}
          >
            🔍 MCP
          </NavLink>
        </nav>

        {/* Page Content */}
        <Routes>
          <Route
            path="/chat"
            element={
              <div>
                <Chat />
              </div>
            }
          />
          <Route
            path="/tools"
            element={
              <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20 }}>
                <div>
                  <ToolRunner />
                </div>
                <div>
                  <ToolInspector />
                </div>
              </div>
            }
          />
          <Route
            path="/mcp"
            element={
              <div>
                <McpInspector />
              </div>
            }
          />
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="*" element={<p>Select a page from above 👆</p>} />
        </Routes>
      </div>
    </Router>
  );
}
