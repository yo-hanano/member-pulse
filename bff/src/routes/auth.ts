import { Hono } from "hono";
import { verifyCurrentPassword, verifyUser } from "../services/authenticate.js";
import { redis } from "../services/redis-client.js";
import { getUserInfoBySessionId } from "../services/user-info.js";
import type { AppEnv } from "../types/env.js";

// 認証関連のルートを集約
const authRoutes = new Hono<AppEnv>();
// セッションTTL（Redis保存とCookie有効期限の基準）
const SESSION_TTL_SECONDS =
  Number(process.env.SESSION_TTL_SECONDS ?? "604800") || 60 * 60 * 24 * 7;
// ログアウト通知用のRedis Pub/Subチャネル
const LOGOUT_CHANNEL = "logout";
// backendのベースURL（.envで明示指定必須）
const backendBaseUrl = process.env.BACKEND_BASE_URL;
if (!backendBaseUrl) {
  throw new Error("BACKEND_BASE_URL is not set");
}

// ログイン処理
// 1) DBで認証（会社コード＋メール＋パスワード）
// 2) セッションIDを発行してRedisへ保存
// 3) Cookieを返してログイン完了
authRoutes.post("/auth/login", async (c) => {
  const { email, password, companyCode } = await c.req.json<{
    email: string;
    password: string;
    companyCode: string;
  }>();
  // DBで認証
  const authResult = await verifyUser(email, password, companyCode);
  if (!authResult) {
    return c.json(
      { error: "メールアドレスまたはパスワードが間違っています" },
      401,
    );
  }
  c.set("userId", String(authResult.user.id));
  c.set("companyId", String(authResult.user.company_id));

  const session = c.get("session");
  if (!session) {
    return c.json({ error: "session unavailable" }, 500);
  }
  // セッションIDはBFF側で発行し、Redisに紐づける
  const sessionId =
    session?.get?.("sessionId") ??
    (typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`);

  session.set("sessionId", sessionId);
  const groups = authResult.user.is_admin ? ["admin"] : ["user"];

  // backend側が参照するUserInfoをRedisに保存
  await redis.set(
    String(sessionId),
    JSON.stringify({
      userId: String(authResult.user.id),
      name: authResult.user.name,
      companyId: authResult.user.company_id,
      email: authResult.user.email,
      groups,
    }),
    "EX",
    SESSION_TTL_SECONDS,
  );

  // CookieはセッションIDのみ。JWTやユーザー属性はRedis側に保持
  return c.json({ ok: true });
});

// パスワード再設定リクエスト（BFF経由でbackendへ中継）
authRoutes.post("/auth/password/reset/request", async (c) => {
  const { companyCode, email } = await c.req.json<{
    companyCode: string;
    email: string;
  }>();

  const res = await fetch(
    `${backendBaseUrl}/public/employee/password/reset/request`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyCode, email }),
    },
  );

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "text/plain" },
  });
});

// パスワード再設定完了（BFF経由でbackendへ中継）
authRoutes.post("/auth/password/reset/complete", async (c) => {
  const { token, newPassword } = await c.req.json<{
    token: string;
    newPassword: string;
  }>();

  const res = await fetch(
    `${backendBaseUrl}/public/employee/password/reset/complete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    },
  );

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "text/plain" },
  });
});

// 招待トークン検証（BFF経由でbackendへ中継）
authRoutes.post("/auth/employee/invite/verify", async (c) => {
  const { token } = await c.req.json<{ token: string }>();

  const res = await fetch(`${backendBaseUrl}/public/employee/invite/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "text/plain" },
  });
});

// 招待完了（BFF経由でbackendへ中継）
authRoutes.post("/auth/employee/invite/complete", async (c) => {
  const { token, newPassword } = await c.req.json<{
    token: string;
    newPassword: string;
  }>();

  const res = await fetch(`${backendBaseUrl}/public/employee/invite/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "text/plain" },
  });
});

// ログアウト処理
// 1) セッション破棄
// 2) JWTキャッシュ無効化
authRoutes.post("/auth/logout", async (c) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: "session unavailable" }, 500);
  }
  const sessionId = session?.get?.("sessionId");
  if (sessionId) {
    await redis.del(String(sessionId));
    await redis.publish(LOGOUT_CHANNEL, String(sessionId));
  }
  session?.deleteSession?.();
  return c.json({ ok: true });
});

// セッション確認
// 1) セッションがあればユーザー情報を返す
// 2) 無ければ401
authRoutes.get("/auth/me", async (c) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: "session unavailable" }, 500);
  }
  const sessionId = session.get("sessionId");
  if (!sessionId) {
    return c.json({ error: "unauthorized" }, 401);
  }
  const userInfo = await getUserInfoBySessionId(String(sessionId));
  if (!userInfo?.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }
  c.set("userId", String(userInfo.userId));
  if (userInfo.companyId) {
    c.set("companyId", String(userInfo.companyId));
  }
  return c.json({
    userId: userInfo.userId,
    companyId: userInfo.companyId,
    email: userInfo.email,
    name: userInfo.name,
    groups: userInfo.groups ?? [],
  });
});

// 現在パスワード検証（本人のみ）
authRoutes.post("/auth/password/verify", async (c) => {
  const payload = await c.req
    .json<{
      currentPassword?: unknown;
    }>()
    .catch(() => null);
  if (!payload) {
    return c.json({ error: "invalid request body" }, 400);
  }
  const currentPassword =
    typeof payload.currentPassword === "string" ? payload.currentPassword : "";
  if (!currentPassword) {
    return c.json({ error: "currentPassword is required" }, 400);
  }

  const session = c.get("session");
  if (!session) {
    return c.json({ error: "session unavailable" }, 500);
  }
  const sessionId = session.get("sessionId");
  if (!sessionId) {
    return c.json({ error: "unauthorized" }, 401);
  }
  const userInfo = await getUserInfoBySessionId(String(sessionId));
  if (!userInfo?.userId || !userInfo.companyId) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const isValid = await verifyCurrentPassword({
    userId: String(userInfo.userId),
    companyId: String(userInfo.companyId),
    currentPassword,
  });
  if (!isValid) {
    return c.json({ error: "現在のパスワードが正しくありません" }, 401);
  }

  return c.json({ ok: true });
});

export { authRoutes };
