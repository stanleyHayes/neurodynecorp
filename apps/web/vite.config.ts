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

          // Anchored on both sides. The previous /\/react\// left react-is
          // unclaimed, and the bundler folded it into the "markdown" chunk —
          // so MUI, which depends on react-is, dragged react-markdown's 160 kB
          // onto every route including the homepage, which renders no markdown
          // at all.
          if (/\/(react|react-dom|react-is|react-router|scheduler)\//.test(id)) return "react";
          if (id.includes("@mui/")) return "mui";
          if (id.includes("framer-motion")) return "motion";

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
