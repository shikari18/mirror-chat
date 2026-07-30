import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Set Nitro build target to Node.js server for Render deployment
process.env.NITRO_PRESET = process.env.NITRO_PRESET || "node-server";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    preview: {
      allowedHosts: true,
    },
  },
});
