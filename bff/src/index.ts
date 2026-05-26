import { serve } from "@hono/node-server";
import { logger } from "./services/logger.js";

const loadVaultConfig = async (): Promise<void> => {
  // Vault secret/edge から実行時設定を読み込み、未設定の環境変数に反映する
  const vaultAddr = process.env.VAULT_ADDR ?? "http://vault:8200";
  const vaultToken = process.env.VAULT_TOKEN;
  if (!vaultToken) {
    throw new Error("VAULT_TOKEN is required to load Vault config");
  }

  const res = await fetch(`${vaultAddr}/v1/secret/data/edge`, {
    headers: {
      "X-Vault-Token": vaultToken,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load Vault config from secret/edge (${res.status})`);
  }

  const payload = await res.json();
  const vaultData = payload?.data?.data ?? {};
  const keys = [
    "SESSION_SECRET",
    "BACKEND_GRAPHQL_URL",
    "BACKEND_BASE_URL",
    "DATABASE_URL",
    "REDIS_URL",
    "REDIS_HOST",
    "REDIS_PORT",
    "COOKIE_SECURE",
    "SESSION_COOKIE_NAME",
    "SESSION_TTL_SECONDS",
    "CORS_ORIGIN",
    "JWT_ISSUER",
    "VAULT_TRANSIT_KEY",
    "BFF_PORT",
    "APP_ENV",
    "APP_VERSION",
    "RUNTIME_CONFIG_CACHE_CONTROL",
  ];

  for (const key of keys) {
    if (!process.env[key] && vaultData[key]) {
      process.env[key] = String(vaultData[key]);
    }
  }

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required (env or Vault secret/edge)");
  }
};

const start = async (): Promise<void> => {
  await loadVaultConfig();
  const { app } = await import("./app.js");
  const port = Number(process.env.BFF_PORT ?? 3000);
  const hostname = process.env.HOST ?? "0.0.0.0";
  serve({ fetch: app.fetch, port, hostname });
  logger.info(`[edge] listening on http://${hostname}:${port}`);
};

start().catch((error) => {
  logger.error("[bff] failed to start", error);
  process.exit(1);
});
