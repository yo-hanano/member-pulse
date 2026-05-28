import { Outlet } from "react-router";

import { RouteErrorBoundary } from "~/components/errors/route-error-boundary";

export function meta() {
  return [{ title: "会員" }, { name: "description", content: "会員管理" }];
}

// 会員配下ルートのレイアウト。
export default function MembersLayoutRoute() {
  return <Outlet />;
}

// 会員配下で発生したエラーを共通エラーページへ委譲する。
export { RouteErrorBoundary as ErrorBoundary };
