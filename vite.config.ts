import { defineConfig, type ConfigEnv } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }: ConfigEnv) => ({
  base: mode === "production" ? "/saldo-finanzas/" : "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 8000,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 8000,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/recharts/") || id.includes("node_modules/d3-") || id.includes("node_modules/victory-vendor/")) {
            return "charts";
          }
          if (id.includes("node_modules/lucide-react/")) return "icons";
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/scheduler/")) {
            return "react";
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
}));
