import { Button, Card, Surface } from "@heroui/react";

type ErrorPageAction = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "outline";
};

type ErrorPageProps = {
  code: string;
  title: string;
  description: React.ReactNode;
  actions?: ErrorPageAction[];
};

export function ErrorPage({ code, title, description, actions = [] }: ErrorPageProps) {
  // ステータスコード別エラーページの共通レイアウトを提供する。
  return (
    <div className="grid min-h-svh place-items-center bg-default-50 p-4 sm:p-6">
      <Surface className="w-full max-w-2xl rounded-2xl border border-border/60 bg-white p-2 shadow-sm" variant="default">
        <Card className="border-none shadow-none" variant="default">
          <Card.Content className="flex flex-col items-center gap-3 px-6 py-10 text-center sm:px-10 sm:py-14">
            <h1 className="text-[5.5rem] leading-none font-bold sm:text-[7rem]">{code}</h1>
            <p className="text-lg font-semibold">{title}</p>
            <div className="text-muted-foreground text-sm leading-relaxed sm:text-base">{description}</div>
            {actions.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {actions.map((action) => (
                  <Button
                    key={action.label}
                    onPress={action.onPress}
                    variant={action.variant === "outline" ? "outline" : undefined}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </Card.Content>
        </Card>
      </Surface>
    </div>
  );
}
