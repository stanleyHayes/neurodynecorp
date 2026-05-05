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
          if (id.includes("react-router") || id.includes("/react-dom/") || id.match(/\/react\//)) return "react";
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
