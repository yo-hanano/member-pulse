import type { Config } from "@react-router/dev/config";

export default {
  // SPA モード（loader/action はブラウザで実行し、BFF 経由で GraphQL を叩く）
  ssr: false,
  // v8 で旧 future.v8_* フラグは全てデフォルト化・廃止された。
  // middleware / splitRouteModules / Vite Environment API も既定有効のため明示不要。
} satisfies Config;
