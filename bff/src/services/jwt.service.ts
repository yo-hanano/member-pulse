// JWTはVault Transitで署名し、秘密鍵はアプリに置かない
const JWT_ISSUER = process.env.JWT_ISSUER ?? "cxi-system.com";

export interface JwtPayload {
  sub: string;
  jti: string;
  groups?: string[];
}

// Vault TransitでJWTを署名（秘密鍵はアプリに保持しない）
export async function signJwtToken(
  payload: JwtPayload,
  expiresIn = 3600,
): Promise<string> {
  // Vaultの接続情報は環境変数で管理
  const vaultAddr = process.env.VAULT_ADDR ?? "http://vault:8200";
  const transitKey = process.env.VAULT_TRANSIT_KEY;
  if (!transitKey) {
    throw new Error("VAULT_TRANSIT_KEY is required");
  }
  const vaultToken = process.env.VAULT_TOKEN;
  if (!vaultToken) {
    throw new Error("VAULT_TOKEN is required for Vault signing");
  }

  // ヘッダにkidを付与できる場合は付ける
  const header: Record<string, string> = { alg: "RS256", typ: "JWT" };
  try {
    const keyMetaRes = await fetch(`${vaultAddr}/v1/transit/keys/${transitKey}`, {
      headers: { "X-Vault-Token": vaultToken },
    });
    if (keyMetaRes.ok) {
      const meta: any = await keyMetaRes.json();
      const v = meta?.data?.latest_version;
      if (v) header.kid = `v${v}`;
    }
  } catch {
    // kid取得失敗は署名継続
  }

  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iss: JWT_ISSUER,
    iat: now,
    exp: now + expiresIn,
  } as Record<string, unknown>;

  const b64url = (data: string) =>
    Buffer.from(data)
      .toString("base64")
      .replace(/=+$/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  const headerB64 = b64url(JSON.stringify(header));
  const payloadB64 = b64url(JSON.stringify(body));
  const signingInput = `${headerB64}.${payloadB64}`;

  // Vault Transitで署名（秘密鍵はアプリに持たせない）
  const res = await fetch(`${vaultAddr}/v1/transit/sign/${transitKey}/sha2-256`, {
    method: "POST",
    headers: {
      "X-Vault-Token": vaultToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: Buffer.from(signingInput, "utf8").toString("base64"),
      marshaling_algorithm: "jws",
      signature_algorithm: "pkcs1v15",
      hash_algorithm: "sha2-256",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Vault sign failed: ${res.status} ${res.statusText} ${text}`);
  }
  const json: any = await res.json();
  const signature: string | undefined = json?.data?.signature;
  if (!signature) throw new Error("Vault response missing signature");
  const parts = signature.split(":");
  const sigB64 = parts[parts.length - 1];
  const sigDer = Buffer.from(sigB64, "base64");
  // JWS仕様に合わせてbase64url化して結合
  const sigB64Url = sigDer
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${signingInput}.${sigB64Url}`;
}
