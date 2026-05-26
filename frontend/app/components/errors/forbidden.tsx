import { useNavigate } from "react-router";

import { ErrorPage } from "~/components/errors/error-page";

export function ForbiddenError() {
  const navigate = useNavigate();

  // 403エラー時の画面を表示する。
  return (
    <ErrorPage
      actions={[
        { label: "前のページへ", onPress: () => window.history.back(), variant: "outline" },
        { label: "ホームへ戻る", onPress: () => navigate("/") },
      ]}
      code="403"
      description={
        <>
          このリソースを表示する権限がありません。 <br />
          必要な権限を持つアカウントで再度お試しください。
        </>
      }
      title="アクセスが拒否されました"
    />
  );
}
