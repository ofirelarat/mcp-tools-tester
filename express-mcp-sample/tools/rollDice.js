import { z } from 'zod';

export const rollDiceTool = {
  name: "roll_dice",
  config: {
    description: "Roll dice with n sides and get the result",
    inputSchema: z.object({
      sides: z.number().int().min(2).max(100).default(6),
    })
  },
  callback:
    async ({ sides = 6 }) => {
      const roll = Math.floor(Math.random() * sides) + 1

      return {
        content: [
          {
            type: "text",
            text: `🎲 You rolled d${sides}: ${roll}`,
          },
        ],
        structuredContent: { roll, sides },
      };
    }
}