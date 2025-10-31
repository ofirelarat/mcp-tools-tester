// server/routes/chat.js
const express = require("express");
const router = express.Router();
const { generateText /* or streamText */ } = require("ai");
const { openai } = require("@ai-sdk/openai");
const { anthropic } = require("@ai-sdk/anthropic");
const { loadMcpRegistry, loadToolRegistry } = require("../utils/registry");
const { loadToolsFromMCP } = require("../utils/mcpLoader");

const tools = loadToolRegistry();
const mcps = loadMcpRegistry();

const localTools = [];

let mcpTools = [];
(async () => {
    try {
        const toolsArrays = await Promise.all(
            Object.values(mcps).map((mcp) => loadToolsFromMCP(mcp.url))
        );
        // Flatten array of arrays
        mcpTools = toolsArrays.flat();
        console.log("Loaded MCP tools:", mcpTools.map((t) => t.name));
    } catch (err) {
        console.error("Failed to load MCP tools:", err);
    }
})();

function pickModelProvider({ provider, apiKey }) {
    switch (provider) {
        case "openai":
            return openai({ apiKey });  // or openai("model‑id", { apiKey })
        case "claude":
            return anthropic({ apiKey });  // similarly
        case "ollama":
            // Use Ollama provider if available, else fallback
            throw new Error("Ollama provider support not yet implemented");
        default:
            throw new Error("Unsupported provider");
    }
}

// POST /chat
const combinedTools = [...localTools, ...mcpTools];
router.post("/", async (req, res) => {
    try {
        const { messages, provider, modelId, apiKey, stream } = req.body;

        if (!messages || !provider) {
            return res.status(400).json({ error: "messages and provider are required" });
        }

        const modelClient = pickModelProvider({ provider, apiKey });

        if (stream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            const textStream = await generateText.stream({
                model: modelClient(modelId),
                messages,
                tools: combinedTools,
            });

            textStream.on("data", (chunk) => {
                res.write(chunk);
            });
            textStream.on("end", () => res.end());
            textStream.on("error", (err) => {
                console.error(err);
                res.end();
            });

            return;
        }

        const { text, reasoning } = await generateText({
            model: modelClient(modelId),
            messages,
            tools: combinedTools,
        });

        res.json({ result: text, reasoning });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
