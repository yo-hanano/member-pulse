import { Outlet } from "react-router";

import { RouteErrorBoundary } from "~/components/errors/route-error-boundary";

export function meta() {
  return [{ title: "生徒" }, { name: "description", content: "生徒管理" }];
}

// 生徒配下ルートのレイアウト。
export default function StudentsLayoutRoute() {
  return <Outlet />;
}

// 生徒配下で発生したルートエラーを共通エラーページへ委譲する。
export { RouteErrorBoundary as ErrorBoundary };
