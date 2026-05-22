import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Paths setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');

// Resource URI configuration
const resourceUri = 'ui://system-dashboard/mcp-app.html';

// Server State
let diagnosticMode = 'STANDARD';
let memoryGcTriggeredCount = 0;
let systemLogs = [
  { timestamp: new Date().toISOString(), level: 'info', message: 'System diagnostics server started.' },
  { timestamp: new Date().toISOString(), level: 'success', message: 'All system interfaces initialized correctly.' }
];

// Helper to generate dynamic mock system statistics
function getSystemStats() {
  const isExtreme = diagnosticMode === 'EXTREME';

  // CPU usage: in extreme mode, CPU is high (e.g. 75-98%). In standard mode, it's 12-32%.
  const cpuUsage = isExtreme
    ? 75 + Math.random() * 20
    : 12 + Math.random() * 20;

  // Memory usage: base is 38%. Extreme mode adds 35%. GC subtracts memory temporarily.
  let memUsage = 38 + (isExtreme ? 35 : 0) - (memoryGcTriggeredCount * 12);
  if (memUsage < 8) memUsage = 8 + Math.random() * 4;
  if (memUsage > 95) memUsage = 95;

  const totalGb = 16.0;
  const usedGb = (memUsage / 100) * totalGb;

  // Mock active processes tree
  const processes = [
    { pid: 1402, name: 'node server.js', cpu: parseFloat((cpuUsage * 0.35).toFixed(1)), memory: parseFloat((memUsage * 0.32).toFixed(1)), status: 'running' },
    { pid: 1489, name: 'vite dev', cpu: parseFloat((cpuUsage * 0.12).toFixed(1)), memory: parseFloat((memUsage * 0.18).toFixed(1)), status: 'running' },
    { pid: 820, name: 'postgres', cpu: parseFloat((cpuUsage * 0.05).toFixed(1)), memory: parseFloat((memUsage * 0.06).toFixed(1)), status: 'idle' },
    { pid: 211, name: 'redis-server', cpu: parseFloat((cpuUsage * 0.02).toFixed(1)), memory: parseFloat((memUsage * 0.04).toFixed(1)), status: 'idle' },
    { pid: 3452, name: 'system-agent', cpu: isExtreme ? 22.5 : 0.8, memory: 3.2, status: isExtreme ? 'running' : 'sleeping' }
  ];

  const uptime = Math.floor(process.uptime());
  const currentLogs = [...systemLogs];

  // Clear live logs after retrieving them so they don't flood the UI in subsequent updates
  systemLogs = [];

  return {
    systemName: 'express-mcp-server-dash',
    cpu: {
      usage: cpuUsage,
      cores: 8,
      speed: 3.6
    },
    memory: {
      usage: memUsage,
      usedGb: usedGb,
      totalGb: totalGb
    },
    uptime: uptime,
    mode: diagnosticMode,
    timestamp: new Date().toISOString(),
    processes: processes,
    logs: currentLogs
  };
}

// Function to register tools on a server instance
export function registerToolsOnServer(server) {
  // 1. Register get_system_stats App Tool
  registerAppTool(
    server,
    'get_system_stats',
    {
      description: 'Get real-time CPU load, memory allocation, uptime, process tree, and terminal logs.',
      inputSchema: z.object({}),
      _meta: { ui: { resourceUri } }
    },
    async () => {
      const stats = getSystemStats();
      return {
        content: [
          {
            type: 'text',
            text: `🖥️ CPU: ${stats.cpu.usage.toFixed(1)}% | MEM: ${stats.memory.usage.toFixed(1)}% | Uptime: ${stats.uptime}s | Mode: ${stats.mode}`
          }
        ],
        structuredContent: stats
      };
    }
  );

  // 2. Register trigger_action App Tool
  registerAppTool(
    server,
    'trigger_action',
    {
      description: 'Trigger a control action on the server, such as toggling extreme diagnostic mode or running GC.',
      inputSchema: z.object({
        action: z.enum(['toggle_mode', 'gc'])
      }),
      _meta: { ui: { resourceUri } }
    },
    async ({ action }) => {
      if (action === 'toggle_mode') {
        diagnosticMode = diagnosticMode === 'STANDARD' ? 'EXTREME' : 'STANDARD';
        systemLogs.push({
          timestamp: new Date().toISOString(),
          level: diagnosticMode === 'EXTREME' ? 'warn' : 'info',
          message: `Diagnostic mode shifted to: ${diagnosticMode}`
        });
      } else if (action === 'gc') {
        memoryGcTriggeredCount += 1;
        systemLogs.push({
          timestamp: new Date().toISOString(),
          level: 'success',
          message: 'Garbage collection cycle triggered. Reclaimed unused memory handles.'
        });
        // Restore GC adjustment slowly over time
        setTimeout(() => {
          memoryGcTriggeredCount = Math.max(0, memoryGcTriggeredCount - 1);
        }, 15000);
      }

      const stats = getSystemStats();
      return {
        content: [
          {
            type: 'text',
            text: `Action '${action}' completed successfully.`
          }
        ],
        structuredContent: stats
      };
    }
  );

  // 3. Register the UI Resource
  registerAppResource(
    server,
    'System Monitor UI',
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      try {
        const htmlPath = path.join(DIST_DIR, 'mcp-app.html');
        const html = await fs.readFile(htmlPath, 'utf-8');
        return {
          contents: [
            { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }
          ]
        };
      } catch (err) {
        console.error('Error reading bundled HTML UI:', err);
        throw new Error(`Failed to load UI resource. Did you run 'npm run build:ui'? Details: ${err.message}`);
      }
    }
  );
}
