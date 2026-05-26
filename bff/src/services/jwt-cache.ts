import { LRUCache } from "lru-cache";

type Entry = { token: string; expSec: number };

export const jwtCache = new LRUCache<string, Entry>({
  // セッション数に合わせて調整する
  max: 10000,
  // JWT(1h)より少し短くして再発行を促す
  ttl: 55 * 60 * 1000,
  ttlAutopurge: true,
  updateAgeOnGet: true,
});
