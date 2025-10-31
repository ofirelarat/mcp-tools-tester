// routes/tools.js
const express = require("express");
const { loadAllTools, getTool, runTool } = require("../utils/toolsLoader"); // adjust path as needed

const router = express.Router();

// GET /tools - list all tools
router.get("/", (req, res) => {
    const list = loadAllTools();
    res.json({ tools: list });
});

// GET /tools/:id - get specific tool
router.get("/:id", (req, res) => {
    const tool = getTool(req.params.id);
    if (!tool) return res.status(404).json({ error: "Tool not found" });

    const { execute, ...metadata } = tool;
    res.json({ tool: metadata });
});

// POST /tools/:id/run - run tool
router.post("/:id/run", async (req, res) => {
    const tool = getTool(req.params.id);
    if (!tool) return res.status(404).json({ error: "Tool not found" });

    try {
        const result = await runTool(req.params.id, req.body);
        res.json({ result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
