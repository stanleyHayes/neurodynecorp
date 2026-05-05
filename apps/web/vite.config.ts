import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    // Source maps in dev/preview, opt-in for prod via VITE_SOURCEMAP=1
    sourcemap: mode !== "production" || process.env.VITE_SOURCEMAP === "1",
    // Vite's built-in code splitting + manual chunks for better long-term caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router") || id.includes("/react-dom/") || id.match(/\/react\//)) return "react";
          if (id.includes("@mui/")) return "mui";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("react-markdown") || id.includes("remark-")) return "markdown";
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  server: {
    port: 3000,
    strictPort: false,
  },
  preview: {
    port: 3000,
  },
}));
