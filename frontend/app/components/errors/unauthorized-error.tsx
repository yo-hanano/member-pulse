import { useNavigate } from "react-router";

import { ErrorPage } from "~/components/errors/error-page";

export function UnauthorisedError() {
  const navigate = useNavigate();

  // 401エラー時の画面を表示する。
  return (
    <ErrorPage
      actions={[{ label: "ログイン画面へ", onPress: () => navigate("/login") }]}
      code="401"
      description={
        <>
          このリソースにアクセスするにはログインが必要です。 <br />
          正しい認証情報でログインしてください。
        </>
      }
      title="認証が必要です"
    />
  );
}
