# MCP Tools Tester  
A local testing environment for “MCP” tools & LLM workflows.  
*Designed for developers who build tools/plugins for LLMs and want a quick sandbox to test integrations.*  

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)  
[![Docker Pulls](https://img.shields.io/docker/pulls/yourrepo/yourimage.svg)](https://hub.docker.com/…)  <!-- if applicable -->

---

## Table of Contents  
1. [Why this project](#why-this-project)  
2. [Features](#features)  
3. [Requirements](#requirements)  
4. [Quick Start](#quick-start)  
5. [Usage](#usage)  
6. [Adding/Authoring a Tool](#addingauthoring-a-tool)  
7. [Configuration](#configuration)  
8. [Production & Security Notes](#production--security-notes)  
9. [Roadmap](#roadmap)  
10. [Contributing](#contributing)  
11. [License](#license)  

---

## Why this project  
Building tools for large-language-model (LLM) workflows often requires spinning up infrastructure, wiring up APIs, and dealing with sandboxing.  
MCP Tools Tester gives you a **local environment** (UI + API) to:  
- load a JSON-described tool and test it via an LLM (or fallback logic)  
- run a minimal UI to test tool flows end-to-end  
- simulate tool execution in a safe, controlled setting  

---

## Features  
- UI at `http://localhost:5173` (default) for manual testing.  
- REST API endpoint at `http://localhost:5174` for programmatic testing.  
- “Hot-reload” of tool definitions: drop a JSON file in `api/src/tools/` and call `POST /api/reload`.  
- Optional integration with Ollama: if you have the service running locally, the tester will connect; otherwise it will fallback to a deterministic stub.  
- Safe sandbox housing: no arbitrary code execution is enabled by default — ideal for prototyping tool logic.

---

## Requirements  
- Docker & Docker Compose (Desktop preferred)  
- (Optional) [Ollama](https://ollama.ai) running locally on e.g. `localhost:11434` (or another host if configured)  
- `host.docker.internal` should map correctly from the container to your host (in Docker Desktop)  
- If you skip Ollama, the API will fallback to a fixed LLM-response mode  

---

## Quick Start  
```bash
git clone https://github.com/ofirelarat/mcp-tools-tester.git  
cd mcp-tools-tester  
docker compose up --build  
````

Then open your browser: [http://localhost:5173](http://localhost:5173)
And API is available at [http://localhost:5174](http://localhost:5174)

---

## Usage

### Adding / Loading a Tool

1. Create a JSON file describing your tool and place it inside `api/src/tools/`
2. The API will load definitions on startup. To reload tools during runtime:

   ```bash
   curl -X POST http://localhost:5174/api/reload
   ```
3. Example tool definition file: `api/src/tools/example-tool.json`

   ```json
   {
     "name": "exampleTool",
     "description": "A demo tool that echoes input",
     "parameters": [
       { "name": "input", "type": "string", "description": "Text to echo" }
     ]
   }
   ```
4. From the UI or via the API you can test your tool against the LLM (or fallback logic).

### Configuration / Environment Variables

By default the `docker-compose.yml` sets:

```yaml
environment:
  - ENABLE_OLLAMA=true
  - OLLAMA_HOST=http://host.docker.internal:11434
```

If you don’t have Ollama accessible, set `ENABLE_OLLAMA=false`.
If your Ollama host is different, override `OLLAMA_HOST`.

---

## Production & Security Notes

* This tool is designed for **testing / prototyping only**, NOT production.
* The actual tool execution logic is stubbed/minimal. If you need real tool-execution (especially running arbitrary code), you must containerize and sandbox your task logic separately.
* Ensure that any user-supplied data is validated and sanitized.
* Consider enabling authentication, monitoring and access controls if running this beyond local dev.

---

## Roadmap

* [ ] Better UI for tool definition editing
* [ ] Test suite for loaded tools
* [ ] Support for remote LLMs beyond Ollama
* [ ] Analytics dashboard for tool invocation
* …feel free to open an issue if you’d like to contribute!

---

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new feature branch (`git checkout -b feature/my-cool-tool`)
3. Commit your changes & write tests where appropriate
4. Submit a Pull Request and reference the issue you're addressing (if applicable)
5. Please adhere to the coding style (ESLint, Prettier) and update the README as necessary

---

## License

This project is licensed under the [MIT License](LICENSE).

```
