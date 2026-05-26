import { Outlet } from "react-router";

import { RouteErrorBoundary } from "~/components/errors/route-error-boundary";

export function meta() {
  return [{ title: "講師" }, { name: "description", content: "講師管理" }];
}

// 講師配下ルートのレイアウト。
export default function TeachersLayoutRoute() {
  return <Outlet />;
}

// 講師配下で発生したルートエラーを共通エラーページへ委譲する。
export { RouteErrorBoundary as ErrorBoundary };
