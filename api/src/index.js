const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { loadAllTools, getTool } = require("./utils/toolsLoader");
const { callOllamaOrFallback } = require("./llm");
const { v4: uuidv4 } = require("uuid");
const mcpRoutes = require("./routes/mcps");
const { handleChatMessage } = require("./llm");


const app = express();
app.use(cors());
app.use(bodyParser.json());

const TOOLS_DIR = path.join(__dirname, "tools");
let tools = loadAllTools(TOOLS_DIR);

// reload endpoint (helpful during dev)
app.post("/api/reload", (req, res) => {
  tools = loadAllTools(TOOLS_DIR);
  res.json({ ok: true, count: Object.keys(tools).length });
});

// list tools
app.get("/api/tools", (req, res) => {
  res.json(Object.values(tools));
});

// get tool
app.get("/api/tools/:id", (req, res) => {
  const t = getTool(tools, req.params.id);
  if (!t) return res.status(404).json({ error: "not found" });
  res.json(t);
});

// run tool (simulation)
app.post("/api/tools/:id/run", async (req, res) => {
  const t = getTool(tools, req.params.id);
  if (!t) return res.status(404).json({ error: "not found" });

  const executionId = uuidv4();
  const input = req.body || {};
  // Tool run strategy:
  // - If tool defines "runCommand" that is "llm", we call llm with prompt + input
  // - If tool defines "type":"mock", we apply the mock response
  try {
    let result;
    if (t.runCommand === "llm") {
      // Build a prompt (tool can provide promptTemplate)
      const prompt = (t.promptTemplate || "Run tool {{name}} with input: {{input}}")
        .replace("{{name}}", t.name)
        .replace("{{input}}", JSON.stringify(input, null, 2));

      const llmResp = await callOllamaOrFallback(prompt);
      result = { output: llmResp, executionId };
    } else if (t.type === "mock" && t.mockResponse) {
      // do simple interpolate keys from input
      result = { output: typeof t.mockResponse === "string" ? t.mockResponse : t.mockResponse, executionId };
    } else {
      // default: echo input
      result = { output: { echo: input }, executionId };
    }
    res.json({ ok: true, toolId: t.id, result });
  } catch (err) {
    console.error("tool run error", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use("/api/mcps", mcpRoutes);


// chat endpoint: { messages: [{role:'user'|'assistant', content: '...'}] }
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "missing messages" });
  // Flatten messages into a simple prompt for now
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n\n");
  try {
    const reply = await handleChatMessage(prompt);
    res.json({ reply });
  } catch (err) {
    console.error("chat error", err);
    res.status(500).json({ error: err.message });
  }
});

// health
app.get("/api/health", (req, res) => res.json({ ok: true, time: Date.now() }));

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});