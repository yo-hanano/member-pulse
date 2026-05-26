import { Outlet } from "react-router";

import { RouteErrorBoundary } from "~/components/errors/route-error-boundary";

export function meta() {
  return [{ title: "訪問・来塾予定" }, { name: "description", content: "訪問・来塾予定管理" }];
}

// 訪問・来塾予定配下ルートのレイアウト。
export default function ScheduleEventsLayoutRoute() {
  return <Outlet />;
}

// 訪問・来塾予定配下で発生したエラーを共通エラーページへ委譲する。
export { RouteErrorBoundary as ErrorBoundary };
