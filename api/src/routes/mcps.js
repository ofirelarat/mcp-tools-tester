const express = require("express");
const { loadMcpRegistry } = require("../utils/registry");
const { getMcp } = require("../utils/mcpLoader");

const router = express.Router();

const mcpRegistry = loadMcpRegistry();

router.get("/", (req, res) => {
    res.json(Object.values(mcpRegistry));
});

router.get("/:id", (req, res) => {
    const id = req.params.id;
    console.log("Fetching MCP:", id);
    const mcp = getMcp(mcpRegistry, id);
    if (!mcp) return res.status(404).json({ error: "MCP not found" });
    res.json(mcp);
});

/**
 * GET /api/mcp/:id/connect
 * Proxies SSE connection for an MCP (stream to client)
 */
router.get("/:id/connect", async (req, res) => {
    console.log("Proxying MCP command:", req.params.id, req.body);
    const mcp = mcpRegistry[req.params.id];
    if (!mcp) return res.status(404).json({ error: "MCP not found" });

    const upstream = await fetch(mcp.url, {
        headers: { Accept: "text/event-stream" },
    });

    // Set response headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream data back to browser
    upstream.body.on("data", chunk => {
        res.write(chunk);
    });

    upstream.body.on("end", () => {
        res.end();
    });
});

/**
 * POST /api/mcp/:id
 * Proxies JSON commands to the MCP (e.g. list_tools)
 */

router.post("/:id", express.json(), async (req, res) => {
    console.log("Proxying MCP command:", req.params.id, req.body);
    const mcp = mcpRegistry[req.params.id];
    if (!mcp) return res.status(404).json({ error: "MCP not found" });

    try {
        const upstream = await fetch(mcp.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream",
            },
            body: JSON.stringify(req.body),
        });

        if (!upstream.ok) {
            const errorText = await upstream.text();
            console.error(`Upstream error status ${upstream.status}:`, errorText);
            return res.status(upstream.status).send(errorText);
        }

        const contentType = upstream.headers.get("content-type") || "";


        if (contentType.includes("application/json")) {
            const json = await upstream.json();
            return res.status(upstream.status).json(json);
        }

        // Only handle SSE for streaming tool calls
        if (contentType.includes("text/event-stream")) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            const reader = upstream.body.getReader();
            const decoder = new TextDecoder();
            const pump = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(decoder.decode(value));
                }
                res.end();
            };
            pump();
            return;
        }
    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).json({ error: "Proxy failed: " + err.message });
    }
});

module.exports = router;
