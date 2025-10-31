// tools/rollDice.js
import { z } from "zod";

/**
 * Defines a simple dice-rolling MCP tool.
 */
export const rollDiceTool = {
  config: {
    name: "roll_dice",
    description: "Roll dice with n sides and get the result",
    inputSchema: {
      type: "object",
      properties: {
        sides: { type: "integer", minimum: 2, maximum: 100, default: 6 },
      },
      required: [],
    },
  },
  callback:
    async ({ sides }) => {
      const role = Math.floor(Math.random() * sides) + 1

      return {
        content: [
          {
            type: "text",
            text: `🎲 You rolled d${sides}: ${role}`,
          },
        ],
        structuredContent: { role, sides },
      };
    }
}