import type { Redis } from "ioredis";

type SessionDataEntry = {
  value: unknown;
  flash: boolean;
};

type SessionData = {
  _id?: string;
  _data: Record<string, SessionDataEntry>;
  _expire: string | null;
  _delete: boolean;
  _accessed: string | null;
};

type RedisStoreOptions = {
  keyPrefix?: string;
  defaultTtlSeconds?: number;
};

export class RedisStore {
  private redis: Redis;
  private keyPrefix: string;
  private defaultTtlSeconds?: number;

  constructor(redis: Redis, options: RedisStoreOptions = {}) {
    this.redis = redis;
    this.keyPrefix = options.keyPrefix ?? "sess:";
    this.defaultTtlSeconds = options.defaultTtlSeconds;
  }

  private key(sessionId: string) {
    return `${this.keyPrefix}${sessionId}`;
  }

  private computeTtlSeconds(sessionData: SessionData): number | undefined {
    // セッションに有効期限がある場合はそれを優先
    if (sessionData._expire) {
      const ms = new Date(sessionData._expire).getTime() - Date.now();
      return Math.max(1, Math.ceil(ms / 1000));
    }
    return this.defaultTtlSeconds;
  }

  async getSessionById(sessionId?: string): Promise<SessionData | null> {
    // Cookieから渡されたsessionIdをRedisで引く
    if (!sessionId) return null;
    const raw = await this.redis.get(this.key(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  }

  async createSession(sessionId: string, initialData: SessionData): Promise<void> {
    // 初回作成は通常の保存と同じ
    await this.persistSessionData(sessionId, initialData);
  }

  async persistSessionData(sessionId: string, sessionData: SessionData): Promise<void> {
    // TTLがあればEXで保存、無ければ永続
    const ttl = this.computeTtlSeconds(sessionData);
    const payload = JSON.stringify(sessionData);
    if (ttl) {
      await this.redis.set(this.key(sessionId), payload, "EX", ttl);
      return;
    }
    await this.redis.set(this.key(sessionId), payload);
  }

  async deleteSession(sessionId: string): Promise<void> {
    // セッション破棄
    await this.redis.del(this.key(sessionId));
  }
}
