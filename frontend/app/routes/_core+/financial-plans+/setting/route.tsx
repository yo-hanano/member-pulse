import {
  Anchor,
  Badge,
  Button,
  Divider,
  Group,
  Menu,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Timeline,
  Title,
} from "@mantine/core";
import {
  BadgeJapaneseYen,
  BarChart3,
  ClipboardCheck,
  CreditCard,
  History,
  Megaphone,
  NotebookTabs,
  Percent,
  Play,
  Plus,
  Target,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

type MemberPlanRow = {
  id: string;
  name: string;
  description: string;
  currentMembers: number;
  monthlyFee: number;
  churnRate: number;
  newMembers: number;
};

type PlanValues = {
  annualRevenueGoal: number;
  annualProfitGoal: number;
  yearEndMemberGoal: number;
  trialBookingRate: number;
  trialAttendanceRate: number;
  enrollmentRate: number;
  monthlyFixedCost: number;
  monthlyHeadOfficeCost: number;
  variableCostRate: number;
  monthlyAdSpend: number;
  memberPlans: MemberPlanRow[];
};

const initialValues: PlanValues = {
  annualRevenueGoal: 14400000,
  annualProfitGoal: 2400000,
  yearEndMemberGoal: 110,
  trialBookingRate: 70,
  trialAttendanceRate: 80,
  enrollmentRate: 50,
  monthlyFixedCost: 650000,
  monthlyHeadOfficeCost: 120000,
  variableCostRate: 8,
  monthlyAdSpend: 150000,
  memberPlans: [
    {
      id: "regular",
      name: "通常会員",
      description: "月4回",
      currentMembers: 52,
      monthlyFee: 9800,
      churnRate: 2.8,
      newMembers: 3,
    },
    {
      id: "premium",
      name: "上級会員",
      description: "通い放題",
      currentMembers: 18,
      monthlyFee: 17800,
      churnRate: 2,
      newMembers: 2,
    },
    {
      id: "short",
      name: "短期集中",
      description: "3か月集中",
      currentMembers: 10,
      monthlyFee: 24000,
      churnRate: 7,
      newMembers: 1,
    },
  ],
};

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("ja-JP");
const formatYen = (value: number) => yenFormatter.format(value);
const toNumber = (value: string | number) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const toRate = (value: number) => Math.max(value, 0) / 100;
const divideSafely = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0;

export function meta() {
  return [
    { title: "収支計画設定 | MemberPulse" },
    { name: "description", content: "収支計画設定" },
  ];
}

function buildSimulation(values: PlanValues) {
  let memberCount = values.memberPlans.reduce((sum, plan) => sum + plan.currentMembers, 0);
  const months = Array.from({ length: 12 }, (_, index) => {
    const rows = values.memberPlans.map((plan) => {
      const churn = Math.floor(plan.currentMembers * toRate(plan.churnRate));
      const endMembers = Math.max(plan.currentMembers + plan.newMembers * (index + 1) - churn, 0);
      return { ...plan, churn, endMembers, revenue: endMembers * plan.monthlyFee };
    });
    memberCount = rows.reduce((sum, row) => sum + row.endMembers, 0);
    const revenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    const variableCost = Math.round(revenue * toRate(values.variableCostRate));
    const profit =
      revenue -
      variableCost -
      values.monthlyFixedCost -
      values.monthlyHeadOfficeCost -
      values.monthlyAdSpend;
    const newMembers = values.memberPlans.reduce((sum, plan) => sum + plan.newMembers, 0);
    const funnelRate =
      toRate(values.trialBookingRate) *
      toRate(values.trialAttendanceRate) *
      toRate(values.enrollmentRate);
    const inquiries = Math.ceil(divideSafely(newMembers, funnelRate));
    return { index: index + 1, inquiries, memberCount, newMembers, profit, revenue };
  });
  const totalRevenue = months.reduce((sum, month) => sum + month.revenue, 0);
  const totalProfit = months.reduce((sum, month) => sum + month.profit, 0);
  const totalNewMembers = months.reduce((sum, month) => sum + month.newMembers, 0);
  const totalAdSpend = values.monthlyAdSpend * 12;
  return {
    cpo: Math.round(divideSafely(totalAdSpend, totalNewMembers)),
    months,
    totalAdSpend,
    totalInquiries: months.reduce((sum, month) => sum + month.inquiries, 0),
    totalProfit,
    totalRevenue,
    yearEndMembers: months.at(-1)?.memberCount ?? 0,
  };
}

function SectionCard({
  children,
  done,
  icon,
  title,
}: {
  children: ReactNode;
  done: boolean;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Paper className="app-dashboard-surface" p="lg" radius="sm" shadow="xs" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon color={done ? "teal" : "gray"} radius="sm" variant="light">
              {icon}
            </ThemeIcon>
            <Text fw={800}>{title}</Text>
          </Group>
          <Badge color={done ? "teal" : "gray"} radius="sm" variant="light">
            {done ? "設定済み" : "未設定"}
          </Badge>
        </Group>
        <Divider />
        {children}
      </Stack>
    </Paper>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={2}>
      <Text c="dimmed" fw={600} size="xs">
        {label}
      </Text>
      <Text fw={800}>{value}</Text>
    </Stack>
  );
}

// markeman の plan/setting に寄せ、設定カードを埋めてから計算結果を見る画面。
export default function InitialPlanSettingRoute() {
  const [values, setValues] = useState(initialValues);
  const simulation = useMemo(() => buildSimulation(values), [values]);
  const allDone = true;

  const updateNumberField = (field: keyof PlanValues, value: string | number) => {
    // mock状態を更新し、シミュレーション結果へ即時反映する。
    setValues((current) => ({ ...current, [field]: toNumber(value) }));
  };

  const updatePlanRow = (planId: string, field: keyof MemberPlanRow, value: string | number) => {
    // 会員プランごとの計画値を更新する。
    setValues((current) => ({
      ...current,
      memberPlans: current.memberPlans.map((plan) =>
        plan.id === planId ? { ...plan, [field]: toNumber(value) } : plan,
      ),
    }));
  };

  return (
    <Stack gap="lg">
      <Group align="flex-end" justify="space-between">
        <Stack gap={4}>
          <Group gap="xs">
            <Anchor component={Link} c="dimmed" size="sm" to="/">
              ホーム
            </Anchor>
            <Text c="dimmed" size="sm">
              /
            </Text>
            <Anchor component={Link} c="dimmed" size="sm" to="/financial-plans">
              収支計画
            </Anchor>
            <Text c="dimmed" size="sm">
              /
            </Text>
            <Text c="dimmed" size="sm">
              設定
            </Text>
          </Group>
          <Title order={2}>2026年度 ベース計画</Title>
          <Text c="dimmed" size="sm">
            各項目を設定し、計算実行後にシミュレーション結果を確認します。
          </Text>
        </Stack>
        <Button component={Link} to="/financial-plans" variant="outline">
          一覧に戻る
        </Button>
      </Group>

      <Paper className="app-dashboard-surface" p="md" radius="sm" withBorder>
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Badge color="teal" radius="sm" variant="light">
              計算済み
            </Badge>
            <Text size="sm">グループ: 2026年度 / 全社</Text>
            <Text size="sm">期間: 2026年4月 - 2027年3月</Text>
            <Text c="dimmed" size="sm">
              初期セットアップの会員プラン・販管費項目を利用
            </Text>
          </Group>
          <Menu position="bottom-end" shadow="md" width={240}>
            <Menu.Target>
              <Button leftSection={<History size={16} />} variant="light">
                過去実績から初期値を反映
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<History size={16} />}>CRM実績を反映</Menu.Item>
              <Menu.Item leftSection={<Plus size={16} />}>手動実績を反映</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Paper>

      <Timeline active={3} bulletSize={42} lineWidth={2}>
        <Timeline.Item bullet={<Text fw={800}>0</Text>} color="grape" title="過去実績">
          <Paper
            className="app-dashboard-surface"
            p="lg"
            radius="sm"
            shadow="xs"
            withBorder
            mt="md"
          >
            <Group justify="space-between" align="center">
              <Group gap="sm" align="flex-start">
                <ThemeIcon color="grape" radius="sm" variant="light">
                  <History size={18} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text fw={800}>前年実績から成り行きの初期値を作る</Text>
                  <Text c="dimmed" size="sm">
                    CRM実績から自動作成するか、手動入力で前年実績を作成し、現在会員数、平均月謝、退会率、広告費、販管費の初期値にできます。
                  </Text>
                </Stack>
              </Group>
              <Menu position="bottom-end" shadow="md" width={220}>
                <Menu.Target>
                  <Button leftSection={<ClipboardCheck size={16} />} variant="outline">
                    過去実績を作成
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<History size={16} />}>CRM実績から作成</Menu.Item>
                  <Menu.Item leftSection={<Plus size={16} />}>手動で作成</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Paper>
        </Timeline.Item>

        <Timeline.Item bullet={<Text fw={800}>1</Text>} color="teal" title="売上関連">
          <SimpleGrid cols={{ base: 1, xl: 3 }} spacing="md" mt="md">
            <SectionCard done icon={<Target size={18} />} title="目標数値">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <NumberInput
                  allowDecimal={false}
                  label="年間売上目標"
                  min={0}
                  onChange={(value) => updateNumberField("annualRevenueGoal", value)}
                  prefix="¥"
                  thousandSeparator=","
                  value={values.annualRevenueGoal}
                />
                <NumberInput
                  allowDecimal={false}
                  label="年間営業利益目標"
                  min={0}
                  onChange={(value) => updateNumberField("annualProfitGoal", value)}
                  prefix="¥"
                  thousandSeparator=","
                  value={values.annualProfitGoal}
                />
                <NumberInput
                  allowDecimal={false}
                  label="年度末会員数"
                  min={0}
                  onChange={(value) => updateNumberField("yearEndMemberGoal", value)}
                  suffix="人"
                  value={values.yearEndMemberGoal}
                />
              </SimpleGrid>
            </SectionCard>

            <SectionCard done icon={<CreditCard size={18} />} title="会員プラン">
              <Stack gap="sm">
                {values.memberPlans.map((plan) => (
                  <Group key={plan.id} justify="space-between">
                    <Stack gap={0}>
                      <Text fw={700}>{plan.name}</Text>
                      <Text c="dimmed" size="xs">
                        {plan.description}
                      </Text>
                    </Stack>
                    <Text fw={700}>{formatYen(plan.monthlyFee)}</Text>
                  </Group>
                ))}
              </Stack>
            </SectionCard>

            <SectionCard done icon={<Users size={18} />} title="会員数計画">
              <Table.ScrollContainer minWidth={520}>
                <Table withColumnBorders withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>会員</Table.Th>
                      <Table.Th ta="right">現在</Table.Th>
                      <Table.Th ta="right">入会/月</Table.Th>
                      <Table.Th ta="right">退会率</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {values.memberPlans.map((plan) => (
                      <Table.Tr key={plan.id}>
                        <Table.Td>{plan.name}</Table.Td>
                        <Table.Td>
                          <NumberInput
                            allowDecimal={false}
                            min={0}
                            onChange={(value) => updatePlanRow(plan.id, "currentMembers", value)}
                            suffix="人"
                            value={plan.currentMembers}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            allowDecimal={false}
                            min={0}
                            onChange={(value) => updatePlanRow(plan.id, "newMembers", value)}
                            suffix="人"
                            value={plan.newMembers}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            min={0}
                            onChange={(value) => updatePlanRow(plan.id, "churnRate", value)}
                            suffix="%"
                            value={plan.churnRate}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </SectionCard>
          </SimpleGrid>
        </Timeline.Item>

        <Timeline.Item bullet={<Text fw={800}>2</Text>} color="teal" title="経費関連">
          <SimpleGrid cols={{ base: 1, xl: 3 }} spacing="md" mt="md">
            <SectionCard done icon={<BadgeJapaneseYen size={18} />} title="販管費">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <NumberInput
                  allowDecimal={false}
                  label="月額固定費"
                  min={0}
                  onChange={(value) => updateNumberField("monthlyFixedCost", value)}
                  prefix="¥"
                  thousandSeparator=","
                  value={values.monthlyFixedCost}
                />
                <NumberInput
                  allowDecimal={false}
                  label="月額本部経費"
                  min={0}
                  onChange={(value) => updateNumberField("monthlyHeadOfficeCost", value)}
                  prefix="¥"
                  thousandSeparator=","
                  value={values.monthlyHeadOfficeCost}
                />
                <NumberInput
                  label="変動費率"
                  min={0}
                  onChange={(value) => updateNumberField("variableCostRate", value)}
                  suffix="%"
                  value={values.variableCostRate}
                />
              </SimpleGrid>
            </SectionCard>

            <SectionCard done icon={<Megaphone size={18} />} title="広告費">
              <NumberInput
                allowDecimal={false}
                label="月額広告費"
                min={0}
                onChange={(value) => updateNumberField("monthlyAdSpend", value)}
                prefix="¥"
                thousandSeparator=","
                value={values.monthlyAdSpend}
              />
            </SectionCard>

            <SectionCard done icon={<Percent size={18} />} title="集客ファネル">
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <NumberInput
                  label="体験予約率"
                  min={0}
                  onChange={(value) => updateNumberField("trialBookingRate", value)}
                  suffix="%"
                  value={values.trialBookingRate}
                />
                <NumberInput
                  label="体験実施率"
                  min={0}
                  onChange={(value) => updateNumberField("trialAttendanceRate", value)}
                  suffix="%"
                  value={values.trialAttendanceRate}
                />
                <NumberInput
                  label="入会率"
                  min={0}
                  onChange={(value) => updateNumberField("enrollmentRate", value)}
                  suffix="%"
                  value={values.enrollmentRate}
                />
              </SimpleGrid>
            </SectionCard>
          </SimpleGrid>
        </Timeline.Item>

        <Timeline.Item
          bullet={<Text fw={800}>3</Text>}
          color={allDone ? "teal" : "gray"}
          title="シミュレーション結果"
        >
          <Stack gap="md" mt="md">
            <Group>
              <Button leftSection={<Play size={16} />} disabled={!allDone}>
                計算実行
              </Button>
              <Button
                component={Link}
                leftSection={<NotebookTabs size={16} />}
                to="/monthly-reviews"
                variant="outline"
              >
                月次レビューへ進む
              </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
              <Paper className="app-dashboard-surface" p="md" radius="sm" withBorder>
                <SummaryMetric label="年間売上" value={formatYen(simulation.totalRevenue)} />
              </Paper>
              <Paper className="app-dashboard-surface" p="md" radius="sm" withBorder>
                <SummaryMetric label="年間営業利益" value={formatYen(simulation.totalProfit)} />
              </Paper>
              <Paper className="app-dashboard-surface" p="md" radius="sm" withBorder>
                <SummaryMetric
                  label="年度末会員"
                  value={`${numberFormatter.format(simulation.yearEndMembers)}人`}
                />
              </Paper>
              <Paper className="app-dashboard-surface" p="md" radius="sm" withBorder>
                <SummaryMetric label="CPO" value={formatYen(simulation.cpo)} />
              </Paper>
            </SimpleGrid>

            <Paper className="app-dashboard-surface" p="lg" radius="sm" shadow="xs" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="sm">
                    <ThemeIcon color="teal" radius="sm" variant="light">
                      <BarChart3 size={18} />
                    </ThemeIcon>
                    <Text fw={800}>主要KPI</Text>
                  </Group>
                  <Badge color="teal" radius="sm" variant="light">
                    mock計算
                  </Badge>
                </Group>
                <Table.ScrollContainer minWidth={860}>
                  <Table striped withColumnBorders withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>月</Table.Th>
                        <Table.Th ta="right">売上</Table.Th>
                        <Table.Th ta="right">営業利益</Table.Th>
                        <Table.Th ta="right">会員数</Table.Th>
                        <Table.Th ta="right">入会</Table.Th>
                        <Table.Th ta="right">問い合わせ</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {simulation.months.map((month) => (
                        <Table.Tr key={month.index}>
                          <Table.Td>{month.index}か月目</Table.Td>
                          <Table.Td ta="right">{formatYen(month.revenue)}</Table.Td>
                          <Table.Td ta="right">{formatYen(month.profit)}</Table.Td>
                          <Table.Td ta="right">
                            {numberFormatter.format(month.memberCount)}人
                          </Table.Td>
                          <Table.Td ta="right">
                            {numberFormatter.format(month.newMembers)}人
                          </Table.Td>
                          <Table.Td ta="right">
                            {numberFormatter.format(month.inquiries)}件
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Stack>
            </Paper>
          </Stack>
        </Timeline.Item>
      </Timeline>

      <Paper bg="teal.0" p="md" radius="sm" withBorder>
        <Group gap="sm" align="flex-start">
          <ThemeIcon color="teal" radius="xl" variant="filled">
            <ClipboardCheck size={16} />
          </ThemeIcon>
          <Stack gap={4}>
            <Text fw={800}>この構成を MemberPulse の収支計画の原型にする</Text>
            <Text c="dimmed" size="sm">
              list は計画管理、setting は設定カードと計算実行、summary
              は結果確認という分け方にできます。
            </Text>
          </Stack>
        </Group>
      </Paper>
    </Stack>
  );
}
