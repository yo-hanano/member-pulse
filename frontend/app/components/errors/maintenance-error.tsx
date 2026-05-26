import { ErrorPage } from "~/components/errors/error-page";

export function MaintenanceError() {
  // メンテナンス中の案内画面を表示する。
  return (
    <ErrorPage
      actions={[{ label: "詳しく見る", variant: "outline" }]}
      code="503"
      description={
        <>
          現在、システムメンテナンスのためご利用いただけません。 <br />
          復旧までしばらくお待ちください。
        </>
      }
      title="ただいまメンテナンス中です"
    />
  );
}
