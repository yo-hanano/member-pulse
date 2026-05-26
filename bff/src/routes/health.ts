import { Hono } from "hono";

// ヘルスチェック用ルート
const healthRoutes = new Hono();
// L7監視向けのシンプルな疎通確認
healthRoutes.get("/health", (c) => c.text("ok"));

export { healthRoutes };
