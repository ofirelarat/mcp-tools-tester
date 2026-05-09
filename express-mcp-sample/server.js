import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { rollDiceTool } from './tools/rollDice.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

const server = new McpServer({
    name: 'demo-server',
    version: '1.0.0',
});

// Register the dice tool as an app tool
const resourceUri = "ui://dice/index.html";

registerAppTool(
    server,
    rollDiceTool.name,
    rollDiceTool.config,
    rollDiceTool.callback
);

// Register the HTML resource for the dice app UI
registerAppResource(
    server,
    "Dice Roller UI",
    resourceUri,
    {
        description: "Interactive dice roller interface",
    },
    async () => {
        const html = await fs.readFile(
            path.join(__dirname, 'tools', 'dice-ui.html'),
            'utf-8'
        );
        return {
            contents: [
                {
                    uri: resourceUri,
                    mimeType: RESOURCE_MIME_TYPE,
                    text: html
                }
            ]
        };
    }
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