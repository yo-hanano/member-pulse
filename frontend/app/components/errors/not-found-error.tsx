import { useNavigate } from "react-router";

import { ErrorPage } from "~/components/errors/error-page";

export function NotFoundError() {
  const navigate = useNavigate();

  // 404エラー時の画面を表示する。
  return (
    <ErrorPage
      actions={[
        { label: "前のページへ", onPress: () => window.history.back(), variant: "outline" },
        { label: "ホームへ戻る", onPress: () => navigate("/") },
      ]}
      code="404"
      description="お探しのページは存在しないか、移動または削除された可能性があります。"
      title="ページが見つかりません"
    />
  );
}
