import { defineConfig } from "vitest/config";

export default defineConfig({
  // Served from a GitHub Pages project subpath (https://sbahamon.github.io/chicago-budget-game/),
  // so asset URLs must be prefixed with the repo name rather than site root.
  base: "/chicago-budget-game/",
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
