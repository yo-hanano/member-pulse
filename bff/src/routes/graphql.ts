import { Hono } from "hono";
import { jwtCache } from "../services/jwt-cache.js";
import { signJwtToken } from "../services/jwt.service.js";
import {
  getUserInfoBySessionId,
  patchUserInfoBySessionId,
} from "../services/user-info.js";
import type { AppEnv } from "../types/env.js";

const graphqlRoutes = new Hono<AppEnv>();

type GraphqlOperationInfo = {
  name?: string;
  type?: string;
};

type GraphqlResponsePayload = {
  data?: Record<string, unknown>;
  errors?: Array<{ extensions?: { code?: string } }>;
  extensions?: {
    sessionPatch?: unknown;
  };
};

type SessionPatchExtension = {
  userId: string;
  name?: string;
  email?: string;
};

// backendが返す extensions.sessionPatch の実行時バリデーション。
// Zod等を使わず、このルート内で必要最小限の型保証だけ行う。
const parseSessionPatchExtension = (
  value: unknown,
): SessionPatchExtension | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.userId !== "string" || candidate.userId.length === 0) {
    return null;
  }

  return {
    userId: candidate.userId,
    ...(typeof candidate.name === "string" ? { name: candidate.name } : {}),
    ...(typeof candidate.email === "string" ? { email: candidate.email } : {}),
  };
};

// GraphQLリクエストの種別/オペレーション名をログ用に抽出
const extractGraphqlOperationInfo = (bodyText: string): GraphqlOperationInfo => {
  try {
    const parsed = JSON.parse(bodyText) as {
      operationName?: unknown;
      query?: unknown;
    };
    const operationName =
      typeof parsed.operationName === "string" ? parsed.operationName : undefined;
    const query = typeof parsed.query === "string" ? parsed.query : undefined;
    if (!query) {
      return { name: operationName };
    }
    const typeMatch = query.match(/\b(query|mutation|subscription)\b/);
    const nameMatch = query.match(/\b(query|mutation|subscription)\s+([A-Za-z0-9_]+)/);
    return {
      type: typeMatch?.[1],
      name: operationName ?? nameMatch?.[2],
    };
  } catch {
    return {};
  }
};

// BFFのGraphQL入口
// 1) セッションからユーザー情報を取得（未ログインなら401）
// 2) JWTを発行/再利用（短命/再発行制御）
// 3) Authorizationを付与してbackendへ中継
// 4) backendのGraphQLレスポンスを解析し、errors.codeに応じてHTTPステータスを上書き
//
// 目的:
// - BFFが認証境界になるため、JWT署名/更新はここで完結させる
// - backendはGraphQL errorsで失敗を表現するため、HTTPステータスへ翻訳してfrontendに伝える
// - frontendはHTTPステータスで画面遷移（403/401/404など）を判定できる
graphqlRoutes.post("/graphql", async (c) => {
  const backendUrl = process.env.BACKEND_GRAPHQL_URL;
  if (!backendUrl) {
    return c.text("BACKEND_GRAPHQL_URL is not set", 500);
  }

  const session = c.get("session");
  if (!session) {
    return new Response(null, { status: 500 });
  }
  const sessionId = session?.get?.("sessionId");
  if (!sessionId) {
    // 認証情報が無ければ401
    return new Response(null, { status: 401 });
  }
  const userInfo = await getUserInfoBySessionId(String(sessionId));
  if (!userInfo?.userId) {
    return new Response(null, { status: 401 });
  }
  c.set("userId", String(userInfo.userId));
  if (userInfo.companyId) {
    c.set("companyId", String(userInfo.companyId));
  }
  const groups = Array.isArray(userInfo.groups)
    ? userInfo.groups.filter(
        (g): g is string => typeof g === "string" && g.length > 0,
      )
    : [];
  const effectiveGroups = groups.length > 0 ? groups : ["user"];
  const key = String(sessionId);

  // JWTは短命。残り3分未満なら再発行してキャッシュする
  // Vault署名の頻度を抑えるため、LRUキャッシュを優先して利用
  let entry = jwtCache.get(key);
  const now = Math.floor(Date.now() / 1000);
  let jwtStatus: "hit" | "refresh" = "hit";
  if (!entry || entry.expSec - now <= 180) {
    const expiresInSec = 60 * 60;
    const token = await signJwtToken(
      { sub: String(userInfo.userId), jti: String(sessionId), groups: effectiveGroups },
      expiresInSec,
    );
    entry = { token, expSec: now + expiresInSec };
    const ttlMs = Math.min(55 * 60 * 1000, (entry.expSec - now) * 1000);
    jwtCache.set(key, entry, { ttl: ttlMs });
    jwtStatus = "refresh";
  }
  c.set("jwtStatus", jwtStatus);

  const body = await c.req.text();
  const opInfo = extractGraphqlOperationInfo(body);
  if (opInfo.name) {
    c.set("gqlOpName", opInfo.name);
  }
  if (opInfo.type) {
    c.set("gqlOpType", opInfo.type);
  }
  // Authorizationヘッダを付与してバックエンドへ転送
  // BFFは“透過プロキシ”ではなく、認証付きのGraphQLゲートウェイ
  const requestId = c.get("requestId");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // BFFでAuthorizationを付与してバックエンドへ中継
    Authorization: entry ? `Bearer ${entry.token}` : "",
  };
  if (requestId) {
    headers["x-request-id"] = requestId;
  }
  const res = await fetch(backendUrl, {
    method: "POST",
    headers,
    body,
  });

  // backendは常に200を返しつつGraphQL errorsで失敗を表現することがある
  // ここでerrors[].extensions.codeを見てHTTPステータスへ変換する
  // （frontendがResponse.statusで分岐できるようにする）
  //
  // あわせて、成功レスポンスに extensions.sessionPatch があれば
  // BFF責務としてRedisセッションの表示属性（name/email）だけを同期する。
  // operationName比較は使わず、backendからの明示的な同期指示を信頼する。
  const text = await res.text();
  let parsedPayload: GraphqlResponsePayload | null = null;
  let statusOverride: number | undefined;
  try {
    parsedPayload = JSON.parse(text) as GraphqlResponsePayload;
    const code = parsedPayload?.errors?.[0]?.extensions?.code?.toLowerCase();
    switch (code) {
      case "forbidden":
        statusOverride = 403;
        break;
      case "unauthorized":
        statusOverride = 401;
        break;
      case "invalid_password":
        statusOverride = 401;
        break;
      case "not_found":
        statusOverride = 404;
        break;
      case "bad_request":
        statusOverride = 400;
        break;
      default:
        statusOverride = undefined;
    }

    // mutation失敗時はDB更新が成立していないためセッション同期を行わない。
    if (!parsedPayload?.errors?.length) {
      const sessionPatch = parseSessionPatchExtension(
        parsedPayload?.extensions?.sessionPatch,
      );
      // 多層防御:
      // backendが返したuserIdと現在のセッション主体が一致する場合のみ反映する。
      // これにより誤配線や予期しないextensions混入時の誤更新を防ぐ。
      if (sessionPatch && sessionPatch.userId === String(userInfo.userId)) {
        await patchUserInfoBySessionId(key, {
          name: sessionPatch.name,
          email: sessionPatch.email,
        });
      }
    }
  } catch {
    statusOverride = undefined;
  }
  return new Response(text, {
    status: statusOverride ?? res.status,
    headers: res.headers,
  });
});

export { graphqlRoutes };
