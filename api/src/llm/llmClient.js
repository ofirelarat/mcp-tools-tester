const { createChat } = require("@vercel/ai");
const axios = require("axios");

/**
 * Initialize LLM based on provider + API key
 */
function getLLM({ provider, apiKey, model }) {
  // Vercel AI supports multiple providers via the apiKey
  // provider can be "openai", "claude", "ollama" (via local runtime)
  const chat = createChat({
    apiKey,
    model: model || undefined,
    provider, // optional: some setups allow choosing the provider
    host: process.env.OLLAMA_HOST, // for Ollama local runtime
  });

  return chat;
}

/**
 * Wrap LLM with optional tools/MCP
 * @param {Object} llm - the chat object from getLLM
 * @param {Array} tools - array of tools / MCPs in Vercel AI SDK format
 * @returns {Object} agent with call({ messages }) method
 */
function createAgent({ llm, tools = [] }) {
  return {
    call: async ({ input }) => {
      // Vercel AI SDK supports sending tools in the send() call
      const messages = Array.isArray(input)
        ? input
        : [{ role: "user", content: input }];

      const response = await llm.send({
        messages,
        tools: tools.length > 0 ? tools : undefined,
      });

      // response.output_text is the natural language reply
      return { output: response.output_text };
    },
  };
}

module.exports = { getLLM, createAgent };
