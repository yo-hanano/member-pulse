import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  ArrowRight,
  CircleDollarSign,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router";

const kpis = [
  {
    label: "月末会員数",
    value: "186",
    diff: "+8",
    icon: Users,
    color: "teal",
  },
  {
    label: "体験からの入会率",
    value: "42%",
    diff: "+6pt",
    icon: TrendingUp,
    color: "blue",
  },
  {
    label: "問い合わせ数",
    value: "31",
    diff: "目標比 89%",
    icon: MessageSquare,
    color: "violet",
  },
  {
    label: "営業利益",
    value: "¥428k",
    diff: "+12%",
    icon: CircleDollarSign,
    color: "lime",
  },
] as const;

const focusRows = [
  { theme: "体験予約率", current: "61%", target: "70%", status: "要改善" },
  { theme: "退会率", current: "3.1%", target: "2.4%", status: "注意" },
  { theme: "広告 CPO", current: "¥18,400", target: "¥22,000以内", status: "良好" },
];

export default function Home() {
  return (
    <Stack gap="xl">
      <Group align="flex-end" justify="space-between">
        <Stack gap={4}>
          <Badge color="teal" radius="sm" variant="light">
            2026年5月レビュー
          </Badge>
          <Title order={2}>ホーム</Title>
          <Text c="dimmed" size="sm">
            月次の実績と次に見るべき指標をまとめています。
          </Text>
        </Stack>
        <Button
          component={Link}
          leftSection={<Settings size={16} />}
          rightSection={<ArrowRight size={16} />}
          to="/initial-plan"
          visibleFrom="sm"
        >
          収支計画
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {kpis.map((kpi) => (
          <Paper
            className="app-dashboard-surface"
            key={kpi.label}
            p="lg"
            radius="sm"
            shadow="xs"
            withBorder
          >
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={4}>
                <Text c="dimmed" fw={600} size="sm">
                  {kpi.label}
                </Text>
                <Text fw={700} fz={28} lh={1.1}>
                  {kpi.value}
                </Text>
                <Text c={kpi.diff.startsWith("+") ? "teal" : "dimmed"} fw={600} size="xs">
                  {kpi.diff}
                </Text>
              </Stack>
              <ThemeIcon color={kpi.color} radius="sm" size={42} variant="light">
                <kpi.icon size={22} />
              </ThemeIcon>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
        <Paper className="app-dashboard-surface" p="lg" radius="sm" shadow="xs" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3} size="h4">
                今月の進捗
              </Title>
              <Badge color="teal" variant="light">
                72%
              </Badge>
            </Group>
            <Group justify="center">
              <RingProgress
                label={
                  <Text fw={700} ta="center">
                    72%
                  </Text>
                }
                sections={[{ value: 72, color: "teal" }]}
                size={156}
                thickness={14}
              />
            </Group>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">売上目標</Text>
                <Text fw={600} size="sm">
                  ¥2.4M / ¥3.0M
                </Text>
              </Group>
              <Progress color="teal" radius="xs" value={80} />
              <Group justify="space-between">
                <Text size="sm">会員数目標</Text>
                <Text fw={600} size="sm">
                  186 / 200
                </Text>
              </Group>
              <Progress color="blue" radius="xs" value={93} />
            </Stack>
          </Stack>
        </Paper>

        <Paper
          className="app-dashboard-surface lg:col-span-2"
          p="lg"
          radius="sm"
          shadow="xs"
          withBorder
        >
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3} size="h4">
                重点指標
              </Title>
              <Text c="dimmed" size="sm">
                最大 3 件
              </Text>
            </Group>
            <Box className="overflow-x-auto">
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>テーマ</Table.Th>
                    <Table.Th>実績</Table.Th>
                    <Table.Th>目安</Table.Th>
                    <Table.Th>状態</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {focusRows.map((row) => (
                    <Table.Tr key={row.theme}>
                      <Table.Td>{row.theme}</Table.Td>
                      <Table.Td>{row.current}</Table.Td>
                      <Table.Td>{row.target}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            row.status === "良好"
                              ? "teal"
                              : row.status === "注意"
                                ? "yellow"
                                : "red"
                          }
                          variant="light"
                        >
                          {row.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
