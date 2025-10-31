import { createMcpHandler } from "@vercel/mcp-adapter";
import z from "zod";
// /app/api/mcp/route.ts

const tools: string[] = [];
const mcpHandler = createMcpHandler(
  (server) => {
    // List of tool names
    const tools: string[] = [];

    // Tool 1: Documentation sections
    server.tool(
      "roll_dice",
      "Roll dice with n sides and get the result",
      {
        sides: z.number().min(2).max(100).default(6),
      },
      async ({ sides }) => {
        const roll = Math.floor(Math.random() * sides) + 1;
        return {
          content: [
            {
              type: "text",
              text: `🎲 You rolled d${sides}: ${roll}`,
            },
          ],
          structuredContent: { sides },
        };
      }
    );
    tools.push("role_dice");

    server.tool("list_tools", "List all available tools", {}, async () => {
      return { content: [{ type: "text", text: tools.join(", ") }] };
    });
    tools.push("list_tools");
  },
  {
    serverInfo: { name: "d3-ui MCP", version: "1.0" },
    capabilities: {
      tools: {
        roll_dice: {
          description: "role a dice with n sides and get the result",
        },
        list_tools: { description: "List all available tools" },
      },
    },
  },
  {
    redisUrl: process.env.REDIS_URL,
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  }
);

export { mcpHandler as GET, mcpHandler as POST, mcpHandler as DELETE };
