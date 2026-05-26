import { Hono } from "hono";
import type { AppEnv } from "../types/env.js";

// 公開してよい設定のみを返す（秘密情報は含めない）
const runtimeConfigRoutes = new Hono<AppEnv>();

runtimeConfigRoutes.get("/runtime-config.json", (c) => {
  const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
  const version = process.env.APP_VERSION ?? "dev";
  const cacheControl =
    process.env.RUNTIME_CONFIG_CACHE_CONTROL ?? "no-store";

  c.header("Cache-Control", cacheControl);
  return c.json({
    appEnv,
    version,
    graphqlPath: "/graphql",
    authBasePath: "/auth",
    jwksPath: "/.well-known/jwks.json",
  });
});

export { runtimeConfigRoutes };
