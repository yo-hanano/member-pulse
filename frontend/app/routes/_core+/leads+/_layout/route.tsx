import { Outlet } from "react-router";

import { RouteErrorBoundary } from "~/components/errors/route-error-boundary";

export function meta() {
  return [{ title: "リード" }, { name: "description", content: "リード管理" }];
}

// リード配下ルートのレイアウト。
export default function LeadsLayoutRoute() {
  return <Outlet />;
}

// リード配下で発生したエラーを共通エラーページへ委譲する。
export { RouteErrorBoundary as ErrorBoundary };
