import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/ai-report": {
        target: "https://reportgen-backend-343555083503.asia-south1.run.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-report/, ""),
      },
    },
  },
});
