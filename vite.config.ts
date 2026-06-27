import { defineConfig } from "vitest/config";

export default defineConfig({
  // Vite serves the static mayor-mode web app from the repo root (index.html).
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
