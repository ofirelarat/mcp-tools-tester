import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import cors from 'cors';
import { registerToolsOnServer } from './tools.js';

const app = express();
app.use(cors());
app.use(express.json());

// 4. Transport Setup (Express HTTP Streamable Transport)
app.post('/mcp', async (req, res) => {
  console.log(`Received MCP request: ${req.method} ${req.url}`);
  
  // Create a new server instance for each request
  const server = new McpServer({
    name: 'express-system-monitor',
    version: '1.0.0',
  });
  registerToolsOnServer(server);
  
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  res.on('close', () => {
    transport.close().catch(() => { });
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || '3005');
app.listen(port, () => {
  console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
}).on('error', error => {
  console.error('Server error:', error);
  process.exit(1);
});
