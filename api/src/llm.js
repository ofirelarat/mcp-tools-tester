const axios = require("axios");
const { loadRegistry } = require("./utils/registry");

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://host.docker.internal:11434";
const ENABLE_OLLAMA = (process.env.ENABLE_OLLAMA || "true") === "true";

// minimal ollama call — uses the /api/generate endpoint pattern
async function callOllama(prompt) {
    // Ollama API may vary by version; this tries the typical generate model endpoint
    // We do a POST to /api/generate?model=llama2 or the available model name; user can change env
    // We'll call the "llama2" model by default (if installed locally)
    const model = process.env.OLLAMA_MODEL || "llama2";
    const url = `${OLLAMA_HOST}/api/generate?model=${encodeURIComponent(model)}`;
    const payload = { prompt, max_tokens: 300 };

    const r = await axios.post(url, payload, { timeout: 7000 });
    // Ollama response formats vary — try to be resilient:
    if (r.data && (r.data.text || r.data.output)) {
        return r.data.text || r.data.output;
    }
    // if array
    if (Array.isArray(r.data)) {
        return r.data.map(x => x.content || x.text).join("\n");
    }
    return JSON.stringify(r.data);
}

async function callOllamaOrFallback(prompt) {
    if (ENABLE_OLLAMA) {
        try {
            const resp = await callOllama(prompt);
            return resp;
        } catch (err) {
            console.warn("Ollama call failed, falling back:", err.message);
            return fallbackLLM(prompt);
        }
    } else {
        return fallbackLLM(prompt);
    }
}

function fallbackLLM(prompt) {
    // deterministic, helpful fallback for local testing — no network or keys needed
    // keep it short and explicit so it's useful in UI
    return `FALLBACK-LLM RESPONSE:
Prompt length: ${prompt.length} chars
First 400 chars of prompt:
${prompt.slice(0, 400)}
\n\n[This is a local fallback response — install and run Ollama locally and set OLLAMA_HOST to use a local LLM.]`;
}

const registry = loadRegistry();

async function handleChatMessage(prompt) {
    // Combine tool & MCP descriptions for the LLM context
    const toolDescriptions = Object.values(registry.tools)
        .map(t => `Tool: ${t.id} — ${t.description || "no description"}`)
        .join("\n");
    const mcpDescriptions = Object.values(registry.mcps)
        .map(m => `MCP: ${m.id} — ${m.url}`)
        .join("\n");

    const systemContext = `
You are a local assistant with access to tools and MCP endpoints.
Tools available:
${toolDescriptions}

MCP endpoints available:
${mcpDescriptions}

You can call tools directly when requested.
`;

    const llmPrompt = `${systemContext}\nUser: ${prompt}\nAssistant:`;

    const response = await callOllamaOrFallback(llmPrompt);
    return response;
}


module.exports = { callOllamaOrFallback, handleChatMessage };
