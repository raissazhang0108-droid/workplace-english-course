import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { preserveClientHost } from "./src/lib/proxyHost";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        configure: (proxy) => {
          proxy.on("proxyReq", preserveClientHost);
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts"
  }
});
