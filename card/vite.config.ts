import { defineConfig } from "vite";

// One self-contained file: Home Assistant loads the card as a single module.
export default defineConfig({
  // Escape non-ASCII characters so the bundle reads the same under any charset.
  esbuild: { charset: "ascii" },
  build: {
    lib: {
      entry: "src/active-rings-card.ts",
      formats: ["es"],
      fileName: () => "active-rings-card.js",
    },
    outDir: "dist",
    target: "es2021",
    minify: "esbuild",
  },
});
