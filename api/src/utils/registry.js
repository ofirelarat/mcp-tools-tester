const path = require("path");
const { loadAllTools } = require("./toolsLoader");
const { loadAllMcps } = require("./mcpLoader");

const TOOLS_DIR = path.join(__dirname, "..", "tools");
const MCPS_DIR = path.join(__dirname, "..", "mcps");

function loadMcpRegistry() {
    return loadAllMcps(MCPS_DIR);
}

function loadToolRegistry() {
    return loadAllTools(TOOLS_DIR);
}

function loadRegistry() {
    const tools = loadAllTools(TOOLS_DIR);
    const mcps = loadAllMcps(MCPS_DIR);
    return { tools, mcps };
}

module.exports = { loadRegistry, loadMcpRegistry, loadToolRegistry, };
