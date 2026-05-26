import { Outlet } from "react-router";

import { RouteErrorBoundary } from "~/components/errors/route-error-boundary";

export function meta() {
  return [{ title: "エリア" }, { name: "description", content: "エリア管理" }];
}

// エリア配下ルートのレイアウト。
export default function AreasLayoutRoute() {
  return <Outlet />;
}

// エリア配下で発生したルートエラーを共通エラーページへ委譲する。
export { RouteErrorBoundary as ErrorBoundary };
