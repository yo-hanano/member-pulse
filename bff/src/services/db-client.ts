import postgres from "postgres";

let client: ReturnType<typeof postgres> | undefined;

export function getDBClient() {
  if (!client) {
    // 認証用途のみなので単一クライアントを再利用する
    const url =
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@postgres:5432/juku_ops_dev";
    client = postgres(url);
  }
  return client;
}
