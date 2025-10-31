import axios from "axios";

const BASE_URL = import.meta.env.API_URL || "http://localhost:5174";

const api = axios.create({
  baseURL: BASE_URL,
});

export const postSSE = async function (url, data, onMessage, signal) {
  const res = await fetch(BASE_URL + url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(data),
  });


  if (res.status !== 200) {
    const text = await res.text();
    throw new Error(`SSE request failed: ${res.status} ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // split on SSE event boundaries
    let parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop(); // keep incomplete part

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
        }else{
            const parsed = JSON.parse(line);
            onMessage(parsed);
        }
      }
    }
  }

  // handle remaining buffer
  if (buffer.startsWith("data:")) {
    const jsonStr = buffer.replace(/^data:\s*/, "");
    try {
      const parsed = JSON.parse(jsonStr);
      onMessage(parsed);
    } catch { }
  }else{
    const parsed = JSON.parse(buffer);
    onMessage(parsed);
  }
};

export default api;