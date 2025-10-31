import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import Chat from "./Chat";
import ToolInspector from "./ToolInspector";
import ToolRunner from "./ToolRunner";
import McpInspector from "./McpInspector";
import McpRunner from "./McpRunner";

export default function App() {
  const navLinkStyle = ({ isActive }) => ({
    textDecoration: "none",
    color: isActive ? "#0070f3" : "#555",
    fontWeight: isActive ? "bold" : "normal",
    padding: "6px 12px",
    borderRadius: 4,
    backgroundColor: isActive ? "#e6f0ff" : "transparent",
    transition: "background-color 0.2s",
  });

  return (
    <Router>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: 1200,
          margin: "0 auto",
          padding: 20,
        }}
      >
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ marginBottom: 4 }}>MCP & Tools Tester</h1>
          <p style={{ color: "#666" }}>
            API: <code>http://localhost:5174</code>
          </p>
        </header>

        {/* Navigation Bar */}
        <nav
          style={{
            marginBottom: 24,
            display: "flex",
            gap: 16,
            borderBottom: "1px solid #ddd",
            paddingBottom: 8,
          }}
        >
          <NavLink to="/mcp" style={navLinkStyle}>
            🔍 MCP
          </NavLink>
          <NavLink to="/tools" style={navLinkStyle}>
            🧰 Tools
          </NavLink>
          <NavLink to="/chat" style={navLinkStyle}>
            💬 Chat
          </NavLink>
        </nav>

        {/* Page Content */}
        <Routes>
          {/* Chat page */}
          <Route
            path="/chat"
            element={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 8,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: 700,
                    backgroundColor: "#fdfdfd",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 16,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Chat />
                </div>
              </div>
            }
          />

          {/* Tools page */}
          <Route
            path="/tools"
            element={
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 420px",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    backgroundColor: "#fdfdfd",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 16,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <ToolRunner />
                </div>
                <div
                  style={{
                    backgroundColor: "#fdfdfd",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 16,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <ToolInspector />
                </div>
              </div>
            }
          />

          {/* MCP page */}
          <Route
            path="/mcp"
            element={
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 420px",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    backgroundColor: "#fdfdfd",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 16,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <McpRunner />
                </div>
                <div
                  style={{
                    backgroundColor: "#fdfdfd",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 16,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <McpInspector />
                </div>
              </div>
            }
          />

          <Route path="/" element={<Navigate to="/mcp" />} />
          <Route
            path="*"
            element={
              <p style={{ textAlign: "center", color: "#666" }}>
                Select a page from above 👆
              </p>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
