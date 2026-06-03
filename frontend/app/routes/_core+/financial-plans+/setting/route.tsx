import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Flex,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  BadgeJapaneseYen,
  BarChart3,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Edit3,
  Megaphone,
  NotebookTabs,
  Percent,
  Play,
  Plus,
  RotateCw,
  Save,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

type NumericPlanField = Exclude<
  keyof PlanValues,
  "groupName" | "memberPlans" | "periodEnd" | "periodStart"
>;
type TextPlanField = "groupName" | "periodEnd" | "periodStart";

type MemberPlanRow = {
  id: string;
  name: string;
  description: string;
  currentMembers: number;
  monthlyFee: number;
  churnRate: number;
  newMembers: number;
  trialBookingRate: number;
  trialAttendanceRate: number;
  enrollmentRate: number;
};

type PlanValues = {
  groupName: string;
  periodStart: string;
  periodEnd: string;
  revenueGoal: number;
  profitGoal: number;
  yearEndMemberGoal: number;
  monthlyFixedCost: number;
  monthlyHeadOfficeCost: number;
  variableCostRate: number;
  monthlyAdSpend: number;
  memberPlans: MemberPlanRow[];
};

const initialValues: PlanValues = {
  groupName: "2026年度 ベース計画",
  periodStart: "2026-04",
  periodEnd: "2027-03",
  revenueGoal: 14400000,
  profitGoal: 2400000,
  yearEndMemberGoal: 110,
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
      trialBookingRate: 70,
      trialAttendanceRate: 80,
      enrollmentRate: 50,
    },
    {
      id: "premium",
      name: "上級会員",
      description: "通い放題",
      currentMembers: 18,
      monthlyFee: 17800,
      churnRate: 2,
      newMembers: 2,
      trialBookingRate: 68,
      trialAttendanceRate: 82,
      enrollmentRate: 48,
    },
    {
      id: "short",
      name: "短期集中",
      description: "3か月集中",
      currentMembers: 10,
      monthlyFee: 24000,
      churnRate: 7,
      newMembers: 1,
      trialBookingRate: 62,
      trialAttendanceRate: 76,
      enrollmentRate: 42,
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
const formatPlainYen = (value: number) => `${numberFormatter.format(value)} 円`;
const toNumber = (value: string | number) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const toRate = (value: number) => Math.max(value, 0) / 100;
const divideSafely = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0;
const formatPlanMonth = (year: number, monthIndex: number) => {
  const date = new Date(year, monthIndex, 1);
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
};
const getPlanMonths = (periodStart: string, periodEnd: string) => {
  const [startYear, startMonth] = periodStart.split("-").map(Number);
  const [endYear, endMonth] = periodEnd.split("-").map(Number);
  if (!startYear || !startMonth || !endYear || !endMonth) {
    return Array.from({ length: 12 }, (_, index) => ({
      index,
      label: formatPlanMonth(2026, 3 + index),
    }));
  }
  const monthCount = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  const safeMonthCount = Math.min(Math.max(monthCount, 1), 36);
  return Array.from({ length: safeMonthCount }, (_, index) => ({
    index,
    label: formatPlanMonth(startYear, startMonth - 1 + index),
  }));
};

export function meta() {
  return [
    { title: "収支計画設定 | MemberPulse" },
    { name: "description", content: "収支計画設定" },
  ];
}

function buildSimulation(values: PlanValues) {
  const planMonths = getPlanMonths(values.periodStart, values.periodEnd);
  const months = planMonths.map((planMonth) => {
    const rows = values.memberPlans.map((plan) => {
      const churn = Math.floor(plan.currentMembers * toRate(plan.churnRate));
      const endMembers = Math.max(
        plan.currentMembers + plan.newMembers * (planMonth.index + 1) - churn,
        0,
      );
      const funnelRate =
        toRate(plan.trialBookingRate) *
        toRate(plan.trialAttendanceRate) *
        toRate(plan.enrollmentRate);
      const inquiries = Math.ceil(divideSafely(plan.newMembers, funnelRate));
      return { ...plan, churn, endMembers, inquiries, revenue: endMembers * plan.monthlyFee };
    });
    const memberCount = rows.reduce((sum, row) => sum + row.endMembers, 0);
    const revenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    const variableCost = Math.round(revenue * toRate(values.variableCostRate));
    const profit =
      revenue -
      variableCost -
      values.monthlyFixedCost -
      values.monthlyHeadOfficeCost -
      values.monthlyAdSpend;
    const newMembers = values.memberPlans.reduce((sum, plan) => sum + plan.newMembers, 0);
    const inquiries = rows.reduce((sum, row) => sum + row.inquiries, 0);
    return {
      index: planMonth.index + 1,
      inquiries,
      label: planMonth.label,
      memberCount,
      newMembers,
      profit,
      revenue,
    };
  });
  const totalRevenue = months.reduce((sum, month) => sum + month.revenue, 0);
  const totalProfit = months.reduce((sum, month) => sum + month.profit, 0);
  const totalNewMembers = months.reduce((sum, month) => sum + month.newMembers, 0);
  const totalAdSpend = values.monthlyAdSpend * months.length;
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

function sectionGridColumns(cardCount: number) {
  if (cardCount >= 3) return "minmax(280px, 1fr) minmax(420px, 1.6fr) minmax(260px, 0.85fr)";
  return "minmax(420px, 1fr) minmax(260px, 0.42fr)";
}

function SettingSection({
  children,
  number,
  title,
  cardCount,
}: {
  children: React.ReactNode;
  number: number;
  title: string;
  cardCount: number;
}) {
  return (
    <Box style={{ position: "relative", paddingLeft: 52 }}>
      <ThemeIcon
        color="brand"
        radius="xl"
        size={46}
        style={{ left: 0, position: "absolute", top: -2, zIndex: 1 }}
        variant="filled"
      >
        <Text c="white" fw={800} size="md">
          {number}
        </Text>
      </ThemeIcon>
      <Box
        bg="brand.6"
        style={{ bottom: -28, left: 22, position: "absolute", top: 42, width: 3 }}
      />
      <Group align="center" gap="sm" mb="sm" wrap="nowrap">
        <Text c="brand.7" fw={800} size="lg">
          {title}
        </Text>
        <Box
          style={{
            borderTop: "4px dotted var(--mantine-color-gray-3)",
            flex: 1,
            transform: "translateY(1px)",
          }}
        />
      </Group>
      <Box
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: sectionGridColumns(cardCount),
          alignItems: "start",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function SettingCard({
  children,
  icon,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Paper p="md" radius="sm" shadow="xs" style={{ minHeight: 80 }} withBorder>
      <Stack gap="sm">
        <Group align="center" gap="xs" wrap="nowrap">
          <ThemeIcon color="brand" radius="xl" size="sm" variant="subtle">
            <Check size={18} strokeWidth={3} />
          </ThemeIcon>
          <Text fw={800} size="sm">
            {title}
          </Text>
          <ActionIcon aria-label={`${title}を編集`} color="brand" size="sm" variant="subtle">
            <Edit3 size={16} />
          </ActionIcon>
          <Box
            style={{
              borderTop: "2px solid var(--mantine-color-gray-3)",
              flex: 1,
              minWidth: 20,
            }}
          />
          <ThemeIcon color="gray" radius="sm" size="sm" variant="subtle">
            {icon}
          </ThemeIcon>
        </Group>
        {children}
      </Stack>
    </Paper>
  );
}

function ValueRow({
  dimmed = false,
  label,
  value,
}: {
  dimmed?: boolean;
  label: string;
  value: string;
}) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text c={dimmed ? "dimmed" : undefined} fw={dimmed ? 500 : 700} size="sm">
        {label}
      </Text>
      <Text c={dimmed ? "dimmed" : undefined} fw={700} size="sm" ta="right">
        {value}
      </Text>
    </Group>
  );
}

type MemberPlanSummaryItem = {
  label: string;
  value: string;
};

type MemberPlanSummaryGroup = {
  title: string;
  items: MemberPlanSummaryItem[];
};

// 会員プランの設定値を、markeman のオファーカードと同じ小さな確認タグへ整形する。
function buildMemberPlanSummaryGroups(plan: MemberPlanRow): MemberPlanSummaryGroup[] {
  return [
    {
      title: "在籍・単価前提",
      items: [
        { label: "月謝", value: formatPlainYen(plan.monthlyFee) },
        { label: "期初人数", value: `${numberFormatter.format(plan.currentMembers)} 人` },
        { label: "月次解約率", value: `${plan.churnRate}%` },
      ],
    },
    {
      title: "獲得ファネル",
      items: [
        { label: "体験予約率", value: `${plan.trialBookingRate}%` },
        { label: "体験実施率", value: `${plan.trialAttendanceRate}%` },
        { label: "入会率", value: `${plan.enrollmentRate}%` },
      ],
    },
  ];
}

function MemberPlanSummary({ plan }: { plan: MemberPlanRow }) {
  return (
    <Stack gap="xs" mt={2}>
      {buildMemberPlanSummaryGroups(plan).map((group) => (
        <Flex key={group.title} align="stretch" gap="xs" wrap="nowrap">
          <Text c="dimmed" fw={800} lh={1.2} pt={8} size="xs" w={84}>
            {group.title}
          </Text>
          <Flex gap="xs" style={{ flex: 1, minWidth: 0 }} wrap="nowrap">
            {group.items.map((item) => (
              <Box
                key={`${group.title}-${item.label}`}
                style={{
                  backgroundColor: "var(--mantine-color-gray-0)",
                  border: "1px solid var(--mantine-color-gray-2)",
                  borderRadius: "var(--mantine-radius-sm)",
                  flex: "1 1 0",
                  minWidth: 0,
                  padding: "7px 8px",
                }}
              >
                <Text c="dimmed" fw={700} lh={1.1} size="xs">
                  {item.label}
                </Text>
                <Text fw={800} lh={1.2} mt={4} size="sm">
                  {item.value}
                </Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      ))}
    </Stack>
  );
}

function MemberPlanStatus({ plan }: { plan: MemberPlanRow }) {
  const labels = [
    plan.monthlyFee > 0 ? "月謝設定済み" : "月謝未設定",
    plan.currentMembers > 0 ? "期初人数設定済み" : "期初人数未設定",
    "率設定済み",
  ];

  return (
    <Text c="dimmed" size="xs">
      {labels.join(" ・ ")}
    </Text>
  );
}

function MemberPlanCard({ onEdit, plan }: { onEdit: () => void; plan: MemberPlanRow }) {
  return (
    <Card p={0} radius="sm" shadow="xs" style={{ overflow: "hidden", width: "100%" }} withBorder>
      <Flex align="stretch">
        <Box style={{ backgroundColor: "var(--mantine-color-brand-5)", width: 3 }} />
        <Flex
          align="center"
          gap="md"
          p="md"
          style={{
            backgroundColor: "#ffffff",
            flexGrow: 1,
          }}
        >
          <Stack gap={6} style={{ flexGrow: 1 }}>
            <Group gap="xs" wrap="nowrap">
              <Text fw={800}>{plan.name}</Text>
              <Tooltip label="編集" position="top" withArrow>
                <ActionIcon
                  aria-label={`${plan.name}を編集`}
                  color="gray"
                  onClick={onEdit}
                  size="sm"
                  variant="subtle"
                >
                  <Edit3 size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <MemberPlanSummary plan={plan} />
            <MemberPlanStatus plan={plan} />
          </Stack>
        </Flex>
      </Flex>
    </Card>
  );
}
function EditableNumber({
  label,
  onChange,
  prefix,
  suffix,
  value,
}: {
  label: string;
  onChange: (value: string | number) => void;
  prefix?: string;
  suffix?: string;
  value: number;
}) {
  return (
    <NumberInput
      allowDecimal={false}
      hideControls
      label={label}
      min={0}
      onChange={onChange}
      prefix={prefix}
      size="xs"
      suffix={suffix}
      thousandSeparator=","
      value={value}
    />
  );
}

export default function FinancialPlanSettingRoute() {
  const [values, setValues] = useState(initialValues);
  const [editingPlan, setEditingPlan] = useState<MemberPlanRow | null>(null);
  const simulation = useMemo(() => buildSimulation(values), [values]);
  const planMonths = getPlanMonths(values.periodStart, values.periodEnd);
  const totalMonthlyNewMembers = values.memberPlans.reduce((sum, plan) => sum + plan.newMembers, 0);
  const revenueProgress = Math.round((simulation.totalRevenue / values.revenueGoal) * 100);
  const profitProgress = Math.round((simulation.totalProfit / values.profitGoal) * 100);

  const updateNumberField = (field: NumericPlanField, value: string | number) => {
    // mock状態を更新し、markeman 風の設定カードと着地へ即時反映する。
    setValues((current) => ({ ...current, [field]: toNumber(value) }));
  };
  const updateTextField = (field: TextPlanField, value: string) => {
    // 計画グループの識別情報を更新する。
    setValues((current) => ({ ...current, [field]: value }));
  };
  const updatePlanRow = (planId: string, field: keyof MemberPlanRow, value: string | number) => {
    // 会員プランごとの入会計画値を更新する。
    setValues((current) => ({
      ...current,
      memberPlans: current.memberPlans.map((plan) =>
        plan.id === planId ? { ...plan, [field]: toNumber(value) } : plan,
      ),
    }));
  };
  const openNewMemberPlanDrawer = () => {
    // markeman のオファー追加と同じく、Drawer で新規会員プランを作る。
    setEditingPlan({
      id: `manual-${Date.now()}`,
      name: "新規会員プラン",
      description: "",
      currentMembers: 0,
      monthlyFee: 0,
      churnRate: 3,
      newMembers: 0,
      trialBookingRate: 70,
      trialAttendanceRate: 80,
      enrollmentRate: 50,
    });
  };
  const saveEditingPlan = () => {
    // Drawer で編集した会員プラン前提を設定結果カードへ反映する。
    if (!editingPlan) return;
    setValues((current) => {
      const exists = current.memberPlans.some((plan) => plan.id === editingPlan.id);
      return {
        ...current,
        memberPlans: exists
          ? current.memberPlans.map((plan) => (plan.id === editingPlan.id ? editingPlan : plan))
          : [...current.memberPlans, editingPlan],
      };
    });
    setEditingPlan(null);
  };
  const updateEditingPlan = (field: keyof MemberPlanRow, value: string | number) => {
    // Drawer 内の入力値を一時状態として保持する。
    setEditingPlan((current) => {
      if (!current) return current;
      const nextValue =
        field === "name" || field === "description" ? String(value) : toNumber(value);
      return { ...current, [field]: nextValue };
    });
  };

  return (
    <Stack gap="lg">
      <Group align="flex-end" justify="space-between">
        <Stack gap={4}>
          <Group gap="xs">
            <Anchor c="dimmed" component={Link} size="sm" to="/">
              ホーム
            </Anchor>
            <Text c="dimmed" size="sm">
              /
            </Text>
            <Anchor c="dimmed" component={Link} size="sm" to="/financial-plans">
              収支計画
            </Anchor>
            <Text c="dimmed" size="sm">
              /
            </Text>
            <Text c="dimmed" size="sm">
              設定
            </Text>
          </Group>
          <Group gap="sm">
            <Title order={2}>{values.groupName}</Title>
            <Badge color="brand" radius="sm" variant="light">
              計算済み
            </Badge>
          </Group>
          <Text c="dimmed" size="sm">
            markeman の plan setting に寄せ、売上関連 → 経費関連 → 着地の順で計画前提を確認します。
          </Text>
        </Stack>
        <Group gap="sm">
          <Button component={Link} to="/financial-plans" variant="outline">
            一覧に戻る
          </Button>
          <Button leftSection={<Save size={16} />} variant="light">
            保存
          </Button>
          <Button leftSection={<Play size={16} />}>再計算</Button>
        </Group>
      </Group>

      <Paper p="md" radius="sm" withBorder>
        <SimpleGrid cols={{ base: 1, md: 6 }} spacing="sm">
          <TextInput
            label="グループ名"
            onChange={(event) => updateTextField("groupName", event.currentTarget.value)}
            size="xs"
            value={values.groupName}
          />
          <TextInput
            label="開始月"
            onChange={(event) => updateTextField("periodStart", event.currentTarget.value)}
            size="xs"
            type="month"
            value={values.periodStart}
          />
          <TextInput
            label="終了月"
            onChange={(event) => updateTextField("periodEnd", event.currentTarget.value)}
            size="xs"
            type="month"
            value={values.periodEnd}
          />
          <EditableNumber
            label="売上目標"
            onChange={(value) => updateNumberField("revenueGoal", value)}
            prefix="¥"
            value={values.revenueGoal}
          />
          <EditableNumber
            label="営業利益目標"
            onChange={(value) => updateNumberField("profitGoal", value)}
            prefix="¥"
            value={values.profitGoal}
          />
          <EditableNumber
            label="期末会員目標"
            onChange={(value) => updateNumberField("yearEndMemberGoal", value)}
            suffix="人"
            value={values.yearEndMemberGoal}
          />
        </SimpleGrid>
      </Paper>

      <SettingSection cardCount={2} number={1} title="売上関連">
        <SettingCard icon={<CreditCard size={14} />} title="会員プラン">
          <Stack gap="md">
            <Group justify="space-between">
              <Badge color="gray" radius="sm" variant="outline" w="fit-content">
                会員プラン
              </Badge>
              <Button
                leftSection={<Plus size={14} />}
                onClick={openNewMemberPlanDrawer}
                size="xs"
                variant="light"
              >
                追加
              </Button>
            </Group>
            <Box
              style={{
                display: "grid",
                gap: 14,
                gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))",
              }}
            >
              {values.memberPlans.map((plan) => (
                <MemberPlanCard key={plan.id} onEdit={() => setEditingPlan(plan)} plan={plan} />
              ))}
            </Box>
            <Group justify="center" pt="xs">
              <ChevronDown size={22} />
            </Group>
          </Stack>
        </SettingCard>

        <SettingCard icon={<Users size={14} />} title="入会計画">
          <Stack gap="sm">
            <ValueRow
              label="入会/月 合計"
              value={`${numberFormatter.format(totalMonthlyNewMembers)} 人`}
            />
            <ValueRow
              label="問い合わせ/月"
              value={`${numberFormatter.format(simulation.totalInquiries / planMonths.length)} 件`}
            />
            <Divider variant="dashed" />
            {values.memberPlans.map((plan) => {
              const funnelRate =
                toRate(plan.trialBookingRate) *
                toRate(plan.trialAttendanceRate) *
                toRate(plan.enrollmentRate);
              const inquiries = Math.ceil(divideSafely(plan.newMembers, funnelRate));
              return (
                <SimpleGrid cols={2} key={plan.id} spacing="xs">
                  <EditableNumber
                    label={`${plan.name} 入会/月`}
                    onChange={(value) => updatePlanRow(plan.id, "newMembers", value)}
                    suffix="人"
                    value={plan.newMembers}
                  />
                  <NumberInput
                    disabled
                    hideControls
                    label="必要問い合わせ"
                    size="xs"
                    suffix="件"
                    value={inquiries}
                  />
                </SimpleGrid>
              );
            })}
          </Stack>
        </SettingCard>
      </SettingSection>

      <SettingSection cardCount={2} number={2} title="経費関連">
        <SettingCard icon={<BadgeJapaneseYen size={14} />} title="販管費">
          <Stack gap="sm">
            <Badge color="gray" radius="sm" variant="outline" w="fit-content">
              月次費用
            </Badge>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
              <EditableNumber
                label="固定費"
                onChange={(value) => updateNumberField("monthlyFixedCost", value)}
                prefix="¥"
                value={values.monthlyFixedCost}
              />
              <EditableNumber
                label="本部経費"
                onChange={(value) => updateNumberField("monthlyHeadOfficeCost", value)}
                prefix="¥"
                value={values.monthlyHeadOfficeCost}
              />
              <NumberInput
                hideControls
                label="変動費率"
                min={0}
                onChange={(value) => updateNumberField("variableCostRate", value)}
                size="xs"
                suffix="%"
                value={values.variableCostRate}
              />
            </SimpleGrid>
            <Divider variant="dashed" />
            <ValueRow
              label="月額合計"
              value={formatPlainYen(values.monthlyFixedCost + values.monthlyHeadOfficeCost)}
            />
            <ValueRow dimmed label="変動費率" value={`${values.variableCostRate}%`} />
          </Stack>
        </SettingCard>

        <SettingCard icon={<Megaphone size={14} />} title="広告費">
          <Stack gap="md">
            <ValueRow label="合計" value={formatPlainYen(simulation.totalAdSpend)} />
            <EditableNumber
              label="月額広告費"
              onChange={(value) => updateNumberField("monthlyAdSpend", value)}
              prefix="¥"
              value={values.monthlyAdSpend}
            />
            <ValueRow label="CPO" value={formatPlainYen(simulation.cpo)} />
          </Stack>
        </SettingCard>
      </SettingSection>

      <SettingSection cardCount={2} number={3} title="着地">
        <SettingCard icon={<BarChart3 size={14} />} title="月別着地">
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
                    <Table.Td>{month.label}</Table.Td>
                    <Table.Td ta="right">{formatYen(month.revenue)}</Table.Td>
                    <Table.Td ta="right">{formatYen(month.profit)}</Table.Td>
                    <Table.Td ta="right">{numberFormatter.format(month.memberCount)}人</Table.Td>
                    <Table.Td ta="right">{numberFormatter.format(month.newMembers)}人</Table.Td>
                    <Table.Td ta="right">{numberFormatter.format(month.inquiries)}件</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </SettingCard>

        <SettingCard icon={<Percent size={14} />} title="ライブ試算">
          <Stack gap={8}>
            <ValueRow label="計画期間売上" value={formatPlainYen(simulation.totalRevenue)} />
            <ValueRow label="売上目標比" value={`${revenueProgress}%`} />
            <ValueRow label="営業利益" value={formatPlainYen(simulation.totalProfit)} />
            <ValueRow label="利益目標比" value={`${profitProgress}%`} />
            <ValueRow
              label="期末会員"
              value={`${numberFormatter.format(simulation.yearEndMembers)} 人`}
            />
            <ValueRow label="CPO" value={formatPlainYen(simulation.cpo)} />
            <Divider my="xs" variant="dashed" />
            <Button fullWidth leftSection={<RotateCw size={16} />} variant="light">
              再計算
            </Button>
            <Button fullWidth leftSection={<Copy size={16} />} variant="default">
              コピー
            </Button>
            <Button
              component={Link}
              fullWidth
              leftSection={<NotebookTabs size={16} />}
              to="/monthly-reviews"
              variant="outline"
            >
              月次レビューへ
            </Button>
          </Stack>
        </SettingCard>
      </SettingSection>
      <Drawer
        onClose={() => setEditingPlan(null)}
        opened={Boolean(editingPlan)}
        position="right"
        size="min(720px, 100vw)"
        title={editingPlan ? "会員プラン設定" : undefined}
      >
        {editingPlan ? (
          <Stack gap="md">
            <TextInput
              label="会員プラン名"
              onChange={(event) => updateEditingPlan("name", event.currentTarget.value)}
              value={editingPlan.name}
            />
            <Paper p="md" radius="sm" withBorder>
              <Stack gap="sm">
                <Text c="dimmed" fw={800} size="xs">
                  在籍・単価前提
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                  <NumberInput
                    allowDecimal={false}
                    label="月謝"
                    min={0}
                    onChange={(value) => updateEditingPlan("monthlyFee", value)}
                    prefix="¥"
                    thousandSeparator=","
                    value={editingPlan.monthlyFee}
                  />
                  <NumberInput
                    allowDecimal={false}
                    label="期初人数"
                    min={0}
                    onChange={(value) => updateEditingPlan("currentMembers", value)}
                    suffix="人"
                    value={editingPlan.currentMembers}
                  />
                  <NumberInput
                    label="月次解約率"
                    min={0}
                    onChange={(value) => updateEditingPlan("churnRate", value)}
                    suffix="%"
                    value={editingPlan.churnRate}
                  />
                </SimpleGrid>
              </Stack>
            </Paper>
            <Paper p="md" radius="sm" withBorder>
              <Stack gap="sm">
                <Text c="dimmed" fw={800} size="xs">
                  獲得ファネル
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                  <NumberInput
                    label="体験予約率"
                    max={100}
                    min={0}
                    onChange={(value) => updateEditingPlan("trialBookingRate", value)}
                    suffix="%"
                    value={editingPlan.trialBookingRate}
                  />
                  <NumberInput
                    label="体験実施率"
                    max={100}
                    min={0}
                    onChange={(value) => updateEditingPlan("trialAttendanceRate", value)}
                    suffix="%"
                    value={editingPlan.trialAttendanceRate}
                  />
                  <NumberInput
                    label="入会率"
                    max={100}
                    min={0}
                    onChange={(value) => updateEditingPlan("enrollmentRate", value)}
                    suffix="%"
                    value={editingPlan.enrollmentRate}
                  />
                </SimpleGrid>
              </Stack>
            </Paper>
            <Group justify="flex-end" mt="sm">
              <Button onClick={() => setEditingPlan(null)} variant="default">
                キャンセル
              </Button>
              <Button leftSection={<Save size={16} />} onClick={saveEditingPlan}>
                保存
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Drawer>
    </Stack>
  );
}
