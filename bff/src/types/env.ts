// セッション内で保持する最小データ
export type SessionData = {
  sessionId?: string;
};

// hono-sessions互換のセッションAPI
export type Session = {
  get<K extends keyof SessionData>(key: K): SessionData[K] | null;
  set<K extends keyof SessionData>(key: K, value: SessionData[K]): void;
  deleteSession(): void;
};

// HonoのContextに載せるアプリ共通の拡張型
export type AppEnv = {
  Variables: {
    session: Session | null;
    requestId?: string;
    userId?: string;
    companyId?: string;
    gqlOpName?: string;
    gqlOpType?: string;
    jwtStatus?: "hit" | "refresh";
  };
};
