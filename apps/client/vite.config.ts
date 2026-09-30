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
    sourcemap: mode !== "production" || process.env.VITE_SOURCEMAP === "1",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Anchored on both sides: the previous /\/react\// never matched
          // react-is, which left it unclaimed and folded into whichever chunk
          // the bundler chose — the same misfile that put react-markdown on the
          // marketing site's homepage.
          if (/\/(react|react-dom|react-is|react-router|scheduler)\//.test(id)) return "react";
          if (id.includes("@mui/")) return "mui";
          if (id.includes("framer-motion")) return "motion";
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  server: { port: 5173, strictPort: false },
  preview: { port: 5173 },
}));
