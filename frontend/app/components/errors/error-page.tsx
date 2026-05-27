import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";

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
    <div className="grid min-h-svh place-items-center p-4 sm:p-6">
      <Paper maw={672} p={{ base: "xl", sm: 48 }} radius="sm" shadow="xs" ta="center" withBorder>
        <Stack align="center" gap="md">
          <Title order={1} size="5.5rem">
            {code}
          </Title>
          <Text fw={700} size="lg">
            {title}
          </Text>
          <Text c="dimmed" size="sm">
            {description}
          </Text>
          {actions.length > 0 ? (
            <Group justify="center" mt="sm">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant === "outline" ? "default" : "filled"}
                  onClick={action.onPress}
                >
                  {action.label}
                </Button>
              ))}
            </Group>
          ) : null}
        </Stack>
      </Paper>
    </div>
  );
}
