import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    outDir: "dist",
    sourcemap: mode !== "production" || process.env.VITE_SOURCEMAP === "1",
    // Keep Rollup's dependency graph intact. MDXEditor's Prism language modules
    // rely on CommonJS side-effect ordering; forced vendor chunks can execute a
    // language extension before the Prism global has been initialized.
    chunkSizeWarningLimit: 1200,
  },
  server: { port: 5174, strictPort: false },
  preview: { port: 5174 },
}));
