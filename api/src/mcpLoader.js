const fs = require("fs");
const path = require("path");

function loadAllTools(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const tools = {};
  files.forEach(f => {
    if (!f.endsWith(".json")) return;
    try {
      const content = fs.readFileSync(path.join(dir, f), "utf8");
      const parsed = JSON.parse(content);
      if (parsed.id) {
        tools[parsed.id] = parsed;
      } else {
        // if no id, use filename
        const id = path.basename(f, ".json");
        parsed.id = id;
        tools[id] = parsed;
      }
    } catch (err) {
      console.warn("Failed to load tool file", f, err.message);
    }
  });
  return tools;
}

function getTool(registry, id) {
  return registry[id];
}

module.exports = { loadAllTools, getTool };
