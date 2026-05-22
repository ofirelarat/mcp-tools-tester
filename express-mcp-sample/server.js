import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerAppTool,} from '@modelcontextprotocol/ext-apps/server';
import express from 'express';
import { rollDiceTool } from './tools/rollDice.js';


const app = express();
app.use(express.json());

const server = new McpServer({
    name: 'demo-server',
    version: '1.0.0',
});

registerAppTool(
    server,
    rollDiceTool.name,
    rollDiceTool.config,
    rollDiceTool.callback
);

app.post('/mcp', async (req, res) => {
    console.log(`Received MCP request: ${req.method} ${req.url}`);
    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close();
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