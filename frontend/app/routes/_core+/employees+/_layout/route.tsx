import { Outlet } from "react-router";

import { RouteErrorBoundary } from "~/components/errors/route-error-boundary";

export function meta() {
  return [{ title: "Employees | Alcos" }, { name: "description", content: "従業員管理画面" }];
}

// 従業員配下ルートのレイアウト。
export default function EmployeesLayoutRoute() {
  return <Outlet />;
}

// 従業員配下で発生したエラーを共通エラーページへ委譲する。
export { RouteErrorBoundary as ErrorBoundary };
