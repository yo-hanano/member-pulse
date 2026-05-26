import { useNavigate } from "react-router";

import { ErrorPage } from "~/components/errors/error-page";
import { cn } from "~/lib/utils";

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean;
};

export function GeneralError({ className, minimal = false }: GeneralErrorProps) {
  const navigate = useNavigate();

  // 想定外エラー時の汎用画面を表示する。
  return (
    <div className={cn(className)}>
      <ErrorPage
        actions={
          minimal
            ? []
            : [
                { label: "前のページへ", onPress: () => window.history.back(), variant: "outline" },
                { label: "ホームへ戻る", onPress: () => navigate("/") },
              ]
        }
        code="500"
        description={
          <>
            ご不便をおかけして申し訳ありません。 <br />
            しばらくしてから、もう一度お試しください。
          </>
        }
        title="エラーが発生しました"
      />
    </div>
  );
}
