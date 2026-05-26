import { randomUUID } from "node:crypto";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { sessionMiddleware } from "hono-sessions";
import { redis } from "./services/redis-client.js";
import { RedisStore } from "./services/redis-store.js";
import { logger } from "./services/logger.js";
import type { AppEnv } from "./types/env.js";
import { authRoutes } from "./routes/auth.js";
import { healthRoutes } from "./routes/health.js";
import { graphqlRoutes } from "./routes/graphql.js";
import { jwksRoutes } from "./routes/jwks.js";
import { postalCodeRoutes } from "./routes/postal-code.js";
import { runtimeConfigRoutes } from "./routes/runtime-config.js";

const app = new Hono<AppEnv>();

// アクセスログのフォーマット
const formatAccessLog = (c: Context, elapsedMs: number) => {
  const status = c.res?.status ?? 0;
  const reqId = c.get("requestId");
  const userId = c.get("userId");
  const companyId = c.get("companyId");
  const gqlOpName = c.get("gqlOpName");
  const gqlOpType = c.get("gqlOpType");
  const jwtStatus = c.get("jwtStatus");
  const parts = [`${c.req.method} ${c.req.path} ${status} ${elapsedMs}ms`];
  if (reqId) parts.push(`reqId=${reqId}`);
  if (userId) parts.push(`user=${userId}`);
  if (companyId) parts.push(`company=${companyId}`);
  if (gqlOpType || gqlOpName) {
    const gqlLabel = [gqlOpType, gqlOpName].filter(Boolean).join(":");
    parts.push(`gql=${gqlLabel}`);
  }
  if (jwtStatus) parts.push(`jwt=${jwtStatus}`);
  return parts.join(" ");
};

// ローカルでの切り分け用に最低限のアクセスログを出す
app.use("*", async (c, next) => {
  const requestId = randomUUID();
  c.set("requestId", requestId);
  c.header("x-request-id", requestId);
  const startedAt = Date.now();
  try {
    await next();
  } finally {
    const elapsedMs = Date.now() - startedAt;
    if (c.req.path !== "/health") {
      logger.info(formatAccessLog(c, elapsedMs));
    }
  }
});

// グローバルエラーハンドラ
app.onError((err, c) => {
  logger.error("[bff] unhandled error", err);
  return c.text("Internal Server Error", 500);
});

// セッションはRedisに保存し、CookieはsessionIdのみ持たせる
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET is required");
}
if (sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters");
}
// セッションCookie名（未指定時は固定値）
const sessionName = process.env.SESSION_COOKIE_NAME ?? "__bff_session";
// セッションTTL（秒）。不正値時は1週間にフォールバック
const sessionTtl =
  Number(process.env.SESSION_TTL_SECONDS ?? "604800") || 60 * 60 * 24 * 7;
// CookieのSecure属性（https環境のみtrueにする）
const cookieSecure = process.env.COOKIE_SECURE === "true";
// CORS許可オリジン（カンマ区切りで複数指定可）
const corsOrigin =
  process.env.CORS_ORIGIN?.split(",").map((v) => v.trim()).filter(Boolean) ??
  [];

// CORS設定
app.use(
  "*",
  cors({
    // CORS_ORIGINで指定したオリジンのみ許可
    origin: corsOrigin,
    // Cookie付きリクエストを許可
    credentials: true,
  }),
);

const sessionOptions = {
  // Redisストアにセッション本体を保存
  store: new RedisStore(redis, { defaultTtlSeconds: sessionTtl }),
  // Cookieには暗号化したsessionIdを保存
  encryptionKey: sessionSecret,
  expireAfterSeconds: sessionTtl,
  sessionCookieName: sessionName,
  cookieOptions: {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    path: "/",
    // RedisのTTLと揃えてブラウザ再起動後も自動ログインを維持
    maxAge: sessionTtl,
  },
} as const;

// セッションが不要なエンドポイントでは空セッションを作らない
app.use("/auth/*", sessionMiddleware(sessionOptions));
app.use("/graphql", sessionMiddleware(sessionOptions));

app.route("/", authRoutes);
app.route("/", healthRoutes);
app.route("/", graphqlRoutes);
app.route("/", jwksRoutes);
app.route("/", postalCodeRoutes);
app.route("/", runtimeConfigRoutes);

// フロントエンドの配信元（Docker では frontend build を /public に配置）
const staticRoot = process.env.STATIC_ROOT ?? "./public";

// 静的アセットは BFF が直接配信する
app.use("/*", serveStatic({ root: staticRoot }));
// SPA のフォールバック設定
app.get("*", (c, next) => {
  const path = c.req.path;
  const isApiPath =
    path.startsWith("/auth") ||
    path.startsWith("/graphql") ||
    path.startsWith("/health") ||
    path.startsWith("/.well-known") ||
    path.startsWith("/api");
  if (isApiPath) {
    return next();
  }
  // SPAルーティングのフォールバック（API系は除外）
  return serveStatic({ path: `${staticRoot}/index.html` })(c, next);
});

export { app };
