// hono-sessions の型定義が不足しているため補完
declare module "hono-sessions" {
  import type { MiddlewareHandler } from "hono";

  export class Session<T = any> {
    get<K extends keyof T>(key: K): T[K] | null;
    set<K extends keyof T>(key: K, value: T[K]): void;
    deleteSession(): void;
  }

  export function sessionMiddleware(options: unknown): MiddlewareHandler;
}
