import type { RuntimeConfig } from "~/utils/runtime-config";

declare global {
  interface Window {
    __runtimeConfig?: RuntimeConfig;
  }
}

export {};
