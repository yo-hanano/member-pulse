import { NotFoundError } from "~/components/errors/not-found-error";

// 未定義ルートへのアクセス時に404画面を表示する。
export default function CatchAllRoute() {
  return <NotFoundError />;
}
