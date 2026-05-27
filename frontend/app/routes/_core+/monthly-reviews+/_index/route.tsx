import { Anchor, Breadcrumbs, Paper, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";

export function meta() {
  return [{ title: "月次レビュー" }, { name: "description", content: "月次レビュー" }];
}

// 月次レビューの初期プレースホルダー画面。
export default function MonthlyReviewsIndexRoute() {
  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Breadcrumbs>
          <Anchor component={Link} c="dimmed" size="sm" to="/">
            ホーム
          </Anchor>
          <Text c="dimmed" size="sm">
            月次レビュー
          </Text>
        </Breadcrumbs>
        <Title order={2}>月次レビュー</Title>
        <Text c="dimmed" size="sm">
          売上、会員数、広告費、費用を月次で確認するメイン画面です。
        </Text>
      </Stack>

      <Paper p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="xs">
          <Title order={3} size="h4">
            準備中
          </Title>
          <Text c="dimmed" size="sm">
            月次レビューの入力・集計画面はこの場所に実装します。
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
