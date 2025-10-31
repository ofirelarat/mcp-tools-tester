
const { tools } = require("../tools/tools");

function loadAllTools(dir) {
  return tools;
}

function getTool(id) {
  return tools.find((t) => t.id === id);
}

function runTool(id, input) {
  const tool = tools.find((t) => t.id === id);
  if (!tool) throw new Error("Tool not found: " + id);
  return tool.execute(input);
}

module.exports = { loadAllTools, getTool, runTool };
