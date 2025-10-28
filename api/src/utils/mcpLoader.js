const fs = require("fs");
const path = require("path");

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

module.exports = { loadAllMcps, getMcp };
