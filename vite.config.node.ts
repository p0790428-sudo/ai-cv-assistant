// ALTERNATIVE DEPLOYMENT: Node.js/Edge Runtimes (Vercel, Railway, Netlify)
// This configuration builds TanStack Start for Node.js-compatible runtimes.
// NOTE: This is an ALTERNATIVE config. Use --config vite.config.node.ts when building.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Build for Node.js/Edge runtimes instead of Workers
export default defineConfig({
  tanstackStart: {
    // For Node.js environments, use the standard entry point
    // TanStack Start handles server functions differently in Node vs Workers
    server: { entry: "src/server.node" },
  },
  build: {
    // Ensure the server build outputs compatible JavaScript for Node.js
    outDir: "dist",
    ssrEmitAssets: true,
  },
});
