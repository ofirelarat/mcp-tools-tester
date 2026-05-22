import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables
} from "@modelcontextprotocol/ext-apps";
import "./mcp-app.css";

// 1. DOM Elements
const bodyEl = document.body;
const systemInfoEl = document.getElementById("system-info");
const cpuProgressEl = document.getElementById("cpu-progress");
const cpuValueEl = document.getElementById("cpu-value");
const cpuCoresEl = document.getElementById("cpu-cores");
const memProgressEl = document.getElementById("mem-progress");
const memValueEl = document.getElementById("mem-value");
const memTextEl = document.getElementById("mem-text");
const memDetailsEl = document.getElementById("mem-details");
const uptimeValueEl = document.getElementById("uptime-value");
const diagnosticsModeEl = document.getElementById("diagnostics-mode");
const serverTimeEl = document.getElementById("server-time");
const processListEl = document.getElementById("process-list");
const searchProcessEl = document.getElementById("search-process");
const logTerminalEl = document.getElementById("log-terminal");

// Buttons
const btnRefresh = document.getElementById("btn-refresh");
const btnToggleMode = document.getElementById("btn-diagnostic-toggle");
const btnGc = document.getElementById("btn-gc");

// State
let lastStats = null;
let extremeMode = false;

// 2. circular gauge setup
// Circumference = 2 * PI * r = 2 * Math.PI * 50 = 314.159
const CIRCUMFERENCE = 2 * Math.PI * 50;
if (cpuProgressEl) {
  cpuProgressEl.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
  cpuProgressEl.style.strokeDashoffset = CIRCUMFERENCE;
}

function setCpuProgress(percent) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  cpuProgressEl.style.strokeDashoffset = offset;
  cpuValueEl.textContent = `${Math.round(percent)}%`;
}

// 3. UI rendering helpers
function renderStats(stats) {
  if (!stats) return;
  lastStats = stats;
  
  // Set host details
  systemInfoEl.textContent = `Host System: ${stats.systemName || "Express MCP Server"}`;
  
  // CPU
  setCpuProgress(stats.cpu.usage);
  cpuCoresEl.textContent = `Cores: ${stats.cpu.cores} | Speed: ${stats.cpu.speed} GHz`;
  
  // Memory
  const memPercent = stats.memory.usage;
  memProgressEl.style.width = `${memPercent}%`;
  memValueEl.textContent = `${Math.round(memPercent)}%`;
  memTextEl.textContent = `${stats.memory.usedGb.toFixed(2)} / ${stats.memory.totalGb.toFixed(2)} GB`;
  
  // Server Info
  uptimeValueEl.textContent = formatUptime(stats.uptime);
  extremeMode = stats.mode === "EXTREME";
  diagnosticsModeEl.textContent = stats.mode;
  serverTimeEl.textContent = new Date(stats.timestamp).toLocaleTimeString();
  
  // Toggle extreme theme class
  if (extremeMode) {
    bodyEl.classList.add("extreme-mode");
  } else {
    bodyEl.classList.remove("extreme-mode");
  }
  
  // Process List
  renderProcessTable(stats.processes, searchProcessEl.value);
  
  // Append Logs
  if (stats.logs && stats.logs.length > 0) {
    stats.logs.forEach(log => appendTerminalLog(log));
  }
}

function formatUptime(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

function renderProcessTable(processes, query = "") {
  if (!processes) return;
  
  const filtered = processes.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.pid.toString().includes(query)
  );
  
  if (filtered.length === 0) {
    processListEl.innerHTML = `<tr><td colspan="5" class="table-loading">No matching processes found</td></tr>`;
    return;
  }
  
  processListEl.innerHTML = filtered.map(p => {
    let cpuBadge = "badge-success";
    if (p.cpu > 50) cpuBadge = "badge-danger";
    else if (p.cpu > 20) cpuBadge = "badge-warning";
    
    let memBadge = "badge-success";
    if (p.memory > 30) memBadge = "badge-danger";
    else if (p.memory > 15) memBadge = "badge-warning";

    return `
      <tr>
        <td><code>${p.pid}</code></td>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td><span class="badge ${cpuBadge}">${p.cpu}%</span></td>
        <td><span class="badge ${memBadge}">${p.memory}%</span></td>
        <td><span class="badge badge-success">${p.status}</span></td>
      </tr>
    `;
  }).join("");
}

function appendTerminalLog({ timestamp, level, message }) {
  const dateStr = new Date(timestamp).toLocaleTimeString();
  let colorClass = "text-muted";
  if (level === "info") colorClass = "text-info";
  if (level === "success") colorClass = "text-success";
  if (level === "warn") colorClass = "text-warn";
  if (level === "error") colorClass = "text-error";
  
  const logDiv = document.createElement("div");
  logDiv.className = `log-line ${colorClass}`;
  logDiv.innerHTML = `<span class="text-muted">[${dateStr}]</span> [${level}] ${escapeHtml(message)}`;
  
  logTerminalEl.appendChild(logDiv);
  
  // Keep scrolling to the bottom
  logTerminalEl.scrollTop = logTerminalEl.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// 4. Host Theme Adaptation
function handleHostContextChanged(ctx) {
  if (ctx.theme) {
    applyDocumentTheme(ctx.theme);
  }
  if (ctx.styles?.variables) {
    applyHostStyleVariables(ctx.styles.variables);
  }
  if (ctx.styles?.css?.fonts) {
    applyHostFonts(ctx.styles.css.fonts);
  }
  if (ctx.safeAreaInsets) {
    const { top, right, bottom, left } = ctx.safeAreaInsets;
    bodyEl.style.padding = `${top + 24}px ${right + 24}px ${bottom + 24}px ${left + 24}px`;
  }
}

// 5. Initialize MCP App Client
const app = new App({ name: "System Monitor App", version: "1.0.0" });

// Register Handlers
app.ontoolinput = (params) => {
  console.info("Received tool call input:", params);
};

app.ontoolresult = (result) => {
  console.info("Received tool call result:", result);
  if (result.structuredContent) {
    renderStats(result.structuredContent);
  }
};

app.onhostcontextchanged = handleHostContextChanged;
app.onerror = console.error;

// Connect to Host
app.connect().then(() => {
  console.log("Connected to MCP host");
  const ctx = app.getHostContext();
  if (ctx) {
    handleHostContextChanged(ctx);
  }
  
  // Try to pull initial stats by running the tool
  btnRefresh.click();
});

// 6. UI Interactions (Call Server Tools)
btnRefresh.addEventListener("click", async () => {
  try {
    btnRefresh.disabled = true;
    btnRefresh.innerHTML = '<span class="btn-icon">🔄</span> Refreshing...';
    
    // Call server-side tool
    const result = await app.callServerTool({
      name: "get_system_stats",
      arguments: {}
    });
    
    if (result.structuredContent) {
      renderStats(result.structuredContent);
    }
  } catch (error) {
    console.error("Failed to fetch system stats:", error);
    appendTerminalLog({
      timestamp: new Date().toISOString(),
      level: "error",
      message: `Failed to refresh stats: ${error.message}`
    });
  } finally {
    btnRefresh.disabled = false;
    btnRefresh.innerHTML = '<span class="btn-icon">🔄</span> Refresh Diagnostics';
  }
});

btnToggleMode.addEventListener("click", async () => {
  try {
    btnToggleMode.disabled = true;
    const result = await app.callServerTool({
      name: "trigger_action",
      arguments: { action: "toggle_mode" }
    });
    
    if (result.structuredContent) {
      renderStats(result.structuredContent);
    }
  } catch (error) {
    console.error("Failed to toggle diagnostic mode:", error);
  } finally {
    btnToggleMode.disabled = false;
  }
});

btnGc.addEventListener("click", async () => {
  try {
    btnGc.disabled = true;
    const result = await app.callServerTool({
      name: "trigger_action",
      arguments: { action: "gc" }
    });
    
    if (result.structuredContent) {
      renderStats(result.structuredContent);
    }
  } catch (error) {
    console.error("Failed to run garbage collection:", error);
  } finally {
    btnGc.disabled = false;
  }
});

searchProcessEl.addEventListener("input", (e) => {
  if (lastStats && lastStats.processes) {
    renderProcessTable(lastStats.processes, e.target.value);
  }
});
