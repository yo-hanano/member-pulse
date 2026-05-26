import { Hono } from "hono";
import { exportJWK, importSPKI } from "jose";
import { createHash } from "node:crypto";
import { logger } from "../services/logger.js";

// JWKS配信用ルート
// - Vault Transitに保存されたRSA公開鍵を取得し、JWK形式で返す
// - backendはこのURLを参照してJWT署名検証を行う
const VAULT_ADDR = process.env.VAULT_ADDR ?? "http://vault:8200";
const TRANSIT_KEY = process.env.VAULT_TRANSIT_KEY;
const VAULT_TOKEN = process.env.VAULT_TOKEN;

// base64url変換（JWK/ETag作成用）
const b64url = (b: Buffer | string) =>
  Buffer.from(b).toString("base64").replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");

// PEM (SPKI) → JWK
async function pemToJwk(pem: string) {
  const key = await importSPKI(pem, "RS256");
  return await exportJWK(key);
}

// ETag用の簡易ハッシュ
function sha256base64url(s: string) {
  return b64url(createHash("sha256").update(s).digest());
}

let cachedBody: string | undefined;
let cachedEtag: string | undefined;

const jwksRoutes = new Hono();

jwksRoutes.get("/.well-known/jwks.json", async () => {
  try {
    if (!cachedBody) {
      // Vault Transitから公開鍵を取得してJWKSを生成
      if (!TRANSIT_KEY) throw new Error("VAULT_TRANSIT_KEY required for JWKS");
      if (!VAULT_TOKEN) throw new Error("VAULT_TOKEN required for JWKS");

      const res = await fetch(
        `${VAULT_ADDR}/v1/transit/keys/${encodeURIComponent(TRANSIT_KEY)}`,
        {
          headers: { "X-Vault-Token": VAULT_TOKEN },
        },
      );
      if (!res.ok) {
        throw new Error(`transit key meta fetch failed ${res.status} ${await res.text()}`);
      }
      const meta: any = await res.json();

      // latest_version を優先、なければ keys の最大番号
      const keys: Record<string, { public_key?: string }> = meta?.data?.keys ?? {};
      const latest: number =
        meta?.data?.latest_version ??
        Object.keys(keys)
          .map((k) => Number(k))
          .sort((a, b) => b - a)[0];

      const pem = keys?.[String(latest)]?.public_key;
      if (!pem) throw new Error("public_key not found (ensure RSA key is exportable)");

      const jwk: any = await pemToJwk(pem);
      const kid = latest ? `v${latest}` : sha256base64url(`${jwk.n}:${jwk.e}`);

      const jwks = {
        keys: [
          {
            ...jwk,
            use: "sig",
            alg: "RS256",
            kid,
            kty: "RSA",
          },
        ],
      };

      // キャッシュ（最大5分）して再取得を抑制
      cachedBody = JSON.stringify(jwks);
      cachedEtag = `W/"jwks-${kid}"`;
    }

    return new Response(cachedBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // JWKSは頻繁に変わらないため短めキャッシュ
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        ETag: cachedEtag!,
      },
    });
  } catch (e) {
    logger.error("JWKS loader error", e);
    return new Response('{"error":"unavailable"}', {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
});

export { jwksRoutes };
