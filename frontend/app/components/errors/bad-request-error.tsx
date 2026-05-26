import { useNavigate } from "react-router";

import { ErrorPage } from "~/components/errors/error-page";

export function BadRequestError() {
  const navigate = useNavigate();

  // 400エラー時の画面を表示する。
  return (
    <ErrorPage
      actions={[
        { label: "前のページへ", onPress: () => window.history.back(), variant: "outline" },
        { label: "ホームへ戻る", onPress: () => navigate("/") },
      ]}
      code="400"
      description={
        <>
          送信された内容に誤りがあります。 <br />
          入力内容を確認して、もう一度お試しください。
        </>
      }
      title="不正なリクエストです"
    />
  );
}
