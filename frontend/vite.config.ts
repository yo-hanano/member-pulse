import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(() => {
  const port = Number.parseInt(process.env.FRONTEND_PORT ?? "5173", 10);
  const bffBaseUrl = process.env.VITE_BFF_BASE_URL ?? "http://localhost:3000";

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: port,
      host: "0.0.0.0",
      proxy: {
        "/auth": {
          target: bffBaseUrl,
          changeOrigin: true,
        },
        "/graphql": {
          target: bffBaseUrl,
          changeOrigin: true,
        },
        "/runtime-config.json": {
          target: bffBaseUrl,
          changeOrigin: true,
        },
        "/.well-known": {
          target: bffBaseUrl,
          changeOrigin: true,
        },
        "/api": {
          target: bffBaseUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
