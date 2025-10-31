// tools.js
const tools = [
  {
    id: "example-echo",
    name: "Example Echo",
    description: "Echoes the input message.",
    inputs: {
      message: { type: "string" },
    },
    outputs: {
      content: { type: "object" },
    },
    type: "mock",
    execute: async (input) => {
      if (!input.message) return { error: "Missing input: message" };
      return { content: [{ type: "text", text: input.message }] };
    },
  },
  {
    id: "reverse-string",
    name: "Reverse String",
    description: "Reverses the input string.",
    inputs: {
      text: { type: "string" },
    },
    outputs: {
      content: { type: "object" },
    },
    type: "mock",
    execute: async (input) => {
      if (!input.text) return { error: "Missing input: text" };
      const reversed = input.text.split("").reverse().join("");
      return {
        content: [
          { type: "text", text: reversed },
        ]
      };
    },
  },
];

module.exports = { tools };