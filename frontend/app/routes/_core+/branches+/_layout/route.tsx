import { Outlet } from "react-router";

import { RouteErrorBoundary } from "~/components/errors/route-error-boundary";

export function meta() {
  return [{ title: "拠点" }, { name: "description", content: "拠点管理" }];
}

// 拠点配下ルートのレイアウト。
export default function BranchesLayoutRoute() {
  return <Outlet />;
}

// 拠点配下で発生したルートエラーを共通エラーページへ委譲する。
export { RouteErrorBoundary as ErrorBoundary };
