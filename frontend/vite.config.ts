import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target:       "http://localhost:3001",
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir:    "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames:   "assets/[name].js",
        chunkFileNames:   "assets/[name].js",
        assetFileNames:   "assets/[name].[ext]",
        manualChunks: {
          vendor:   ["react", "react-dom", "react-router-dom"],
          charts:   ["recharts"],
          motion:   ["framer-motion"],
          ethereum: ["ethers"],
          query:    ["@tanstack/react-query"],
        }
      }
    }
  }
});
