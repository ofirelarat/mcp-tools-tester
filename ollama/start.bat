@echo off
echo Starting Ollama container...
docker build -t local-ollama ./ollama
docker run -d --name ollama ^
  -p 11434:11434 ^
  -v ollama-models:/root/.ollama ^
  local-ollama
echo Ollama running on http://localhost:11434
