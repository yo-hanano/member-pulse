import { redis } from "./redis-client.js";

export type UserInfo = {
  userId: string;
  name: string;
  companyId: string;
  email: string;
  groups?: string[];
};

type UserInfoPatch = Partial<Pick<UserInfo, "name" | "email">>;

// Redis上のセッションJSONは外部要因で壊れている可能性もあるため、
// パース失敗時は null を返して呼び出し側で安全にスキップする。
const parseUserInfo = (raw: string): UserInfo | null => {
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
};

export async function getUserInfoBySessionId(
  sessionId: string,
): Promise<UserInfo | null> {
  // backendと同じキー構成（sessionId直指定）に合わせてUserInfoを取得する
  const raw = await redis.get(sessionId);
  if (!raw) {
    return null;
  }
  return parseUserInfo(raw);
}

export async function patchUserInfoBySessionId(
  sessionId: string,
  patch: UserInfoPatch,
): Promise<boolean> {
  // Read-modify-writeで既存のcompanyId/groups等を維持しつつ、差分のみ反映する。
  const raw = await redis.get(sessionId);
  if (!raw) {
    // セッションが既に失効/削除されているケースは失敗ではなく noop 扱い。
    return false;
  }
  const current = parseUserInfo(raw);
  if (!current) {
    // 不正JSONの上書きは避ける。呼び出し側は false を見て追加対応しない。
    return false;
  }

  const next: UserInfo = {
    ...current,
    ...(typeof patch.name === "string" ? { name: patch.name } : {}),
    ...(typeof patch.email === "string" ? { email: patch.email } : {}),
  };
  const payload = JSON.stringify(next);

  // 既存TTLを維持し、期限付きセッションの有効期間を延長しない。
  // account更新が多発しても「更新したからログイン期限が伸びる」挙動を防ぐ。
  const ttlSeconds = await redis.ttl(sessionId);
  if (ttlSeconds > 0) {
    await redis.set(sessionId, payload, "EX", ttlSeconds);
    return true;
  }

  // TTLなし（永続/期限不明）キーは現状構成を崩さずそのまま上書きする。
  await redis.set(sessionId, payload);
  return true;
}
