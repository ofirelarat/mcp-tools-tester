const fs = require("fs");
const path = require("path");
const { parseSSEChunk } = require("./pasreSSE");


function loadAllMcps(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const mcps = {};
  files.forEach(f => {
    if (!f.endsWith(".json")) return;
    try {
      const content = fs.readFileSync(path.join(dir, f), "utf8");
      const parsed = JSON.parse(content);
      if (parsed.id) {
        mcps[parsed.id] = parsed;
      } else {
        // if no id, use filename
        const id = path.basename(f, ".json");
        parsed.id = id;
        mcps[id] = parsed;
      }
    } catch (err) {
      console.warn("Failed to load MCP file", f, err.message);
    }
  });
  return mcps;
}

function getMcp(registry, id) {
  return registry[id];
}


function transformMCPtoTool(tool, mcpUrl) {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema || {},
    run: async (input, onMessage) => {
      const resp = await fetch(mcpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream, text/plain",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: tool.name,
          params: input,
        }),
      });

      const contentType = resp.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && onMessage) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let state = { buffer: "" };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          state = parseSSEChunk(chunk, onMessage, state);
        }
        return;
      }

      if (contentType.includes("application/json")) {
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        return data.result ?? data;
      }

      // fallback to plain text
      if (!resp.ok) throw new Error(await resp.text());
      return await resp.text();
    },
  };
}

async function loadToolsFromMCP(mcpUrl) {
  const resp = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/list",
      params: {},
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to fetch MCP tools: ${text}`);
  }

  const contentType = resp.headers.get("content-type") || "";

  // SSE streaming response
  if (contentType.includes("text/event-stream")) {
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let state = { buffer: "" };
    const tools = [];

    const onMessage = (parsed) => {
      const parsedTools = parsed?.result?.tools;
      if (parsedTools && Array.isArray(parsedTools)) {
        tools.push(...parsedTools);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      state = parseSSEChunk(chunk, onMessage, state);
    }

    return tools.map((t) => transformMCPtoTool(t, mcpUrl));
  }

  // Normal JSON response
  const data = await resp.json();
  if (!data.result || !Array.isArray(data.result.tools)) {
    throw new Error("Invalid MCP tools response");
  }

  return data.result.tools.map((t) => transformMCPtoTool(t, mcpUrl));
}


module.exports = { loadAllMcps, getMcp, transformMCPtoTool, loadToolsFromMCP };
