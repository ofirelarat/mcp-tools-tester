MCP Tester — local tool & LLM testing environment.

Requirements:
- Docker & Docker Compose (desktop recommended)
- Optional: Ollama running locally (https://ollama.ai). If Ollama is running, ensure the container can reach it:
  - On Docker Desktop, `host.docker.internal:11434` should map to your host's Ollama.
  - Set OLLAMA_HOST env in docker-compose.yml if different.
- If you don't run Ollama, the API will fall back to a local deterministic LLM response.

Quick start:
1. Clone this repo.
2. From project root run:
   docker compose up --build

3. Open UI: http://localhost:3000
4. API: http://localhost:3001

How to add your MCP / tool:
- Place a JSON file describing your tool into `api/src/tools/`.
- The API will load files at startup; call POST /api/reload to reload during runtime.
- Tool JSON shape example in `api/src/tools/example-tool.json`.

Using Ollama:
- Install ollama and pull a model locally (example: ollama pull llama2).
- Ensure Ollama is running on host port 11434.
- In docker-compose.yml `api` uses env OLLAMA_HOST=http://host.docker.internal:11434. Change if needed.
- To force fallback (no Ollama), set `ENABLE_OLLAMA=false` in the api service env.

Notes:
- The LLM call in api/src/llm.js is intentionally minimal and resilient to different ollama responses.
- This starter intentionally keeps tool execution local and simple (no code execution). For security and safety, tools that actually execute arbitrary code should be containerized and sandboxed — this template only simulates tool runs or delegates to the LLM.

