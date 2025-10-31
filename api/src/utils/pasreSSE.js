function parseSSEChunk(chunk, onMessage, state = { buffer: "" }) {
  state.buffer += chunk;

  // Split on double newline boundaries (SSE events)
  let parts = state.buffer.split(/\r?\n\r?\n/);
  state.buffer = parts.pop(); // keep incomplete part

  for (const part of parts) {
    const lines = part.split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith("data:")) {
        const jsonStr = line.replace(/^data:\s*/, "");
        try {
          const parsed = JSON.parse(jsonStr);
          onMessage(parsed);
        } catch (err) {
          console.error("Failed to parse SSE JSON:", err, jsonStr);
        }
      }
    }
  }

  return state; // return state for next chunk
}

module.exports = { parseSSEChunk };