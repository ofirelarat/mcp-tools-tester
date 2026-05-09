import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    outDir: "dist",
    target: "ES2022",
    rollupOptions: {
      input: "mcp-app.html",
    },
  },
});