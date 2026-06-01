import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Checkbox,
  Divider,
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
} from "@mantine/core";
import {
  BadgeJapaneseYen,
  Calculator,
  CalendarDays,
  Check,
  ClipboardCheck,
  NotebookTabs,
  Percent,
  Plus,
  SlidersHorizontal,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

type PlanStep = "goals" | "groups" | "baseline" | "adjustment" | "save";

type MemberGroupValues = {
  id: string;
  name: string;
  sourceLabel: string;
  currentMemberCount: number;
  averageMonthlyFee: number;
  monthlyChurnRate: number;
  currentMonthlyNewMemberCount: number;
  adjustedMonthlyNewMemberCount: number;
  adjustedAverageMonthlyFee: number;
  adjustedMonthlyChurnRate: number;
  adjustedMonthlyAdSpend: number;
};

type SetupGuideValues = {
  fiscalYear: number;
  annualRevenueGoal: number;
  annualOperatingProfitGoal: number;
  yearEndMemberCountGoal: number;
  annualAdSpendLimit: number;
  monthlyFixedCostAmount: number;
  monthlyHeadOfficeCostAmount: number;
  variableCostRate: number;
  trialBookingRate: number;
  trialAttendanceRate: number;
  enrollmentRate: number;
  acceptableAdInvestmentRate: number;
  selectedCostTemplates: string[];
  memberGroups: MemberGroupValues[];
};

type CostTemplateOption = {
  code: string;
  label: string;
  description: string;
  costType: "fixed" | "variable";
  scope: "location_direct" | "head_office";
};

type SimulationCase = ReturnType<typeof buildSimulation>["forecast"];

const registeredMasterSummary = {
  businessName: "Member Pilates",
  fiscalYearStartMonth: 4,
  planningScope: "全社計画",
  membershipPlans: ["通常会員", "上級会員", "受験生"],
  costItems: ["家賃", "人件費", "決済手数料", "システム利用料"],
};

const costTemplateOptions: CostTemplateOption[] = [
  {
    code: "rent",
    label: "家賃",
    description: "スタジオごとの毎月固定費として扱います。",
    costType: "fixed",
    scope: "location_direct",
  },
  {
    code: "staff",
    label: "人件費",
    description: "レッスン運営に関わる主な固定費として扱います。",
    costType: "fixed",
    scope: "location_direct",
  },
  {
    code: "payment_fee",
    label: "決済手数料",
    description: "売上率に連動する変動費の候補です。",
    costType: "variable",
    scope: "location_direct",
  },
  {
    code: "system",
    label: "システム利用料",
    description: "予約・会員管理などの本部固定費として扱います。",
    costType: "fixed",
    scope: "head_office",
  },
  {
    code: "accounting",
    label: "税理士・会計",
    description: "全社共通の本部経費として扱います。",
    costType: "fixed",
    scope: "head_office",
  },
];

const initialMemberGroups: MemberGroupValues[] = [
  {
    id: "regular",
    name: "通常会員",
    sourceLabel: "月4回",
    currentMemberCount: 52,
    averageMonthlyFee: 9800,
    monthlyChurnRate: 2.8,
    currentMonthlyNewMemberCount: 2,
    adjustedMonthlyNewMemberCount: 3,
    adjustedAverageMonthlyFee: 9800,
    adjustedMonthlyChurnRate: 2.5,
    adjustedMonthlyAdSpend: 60000,
  },
  {
    id: "premium",
    name: "上級会員",
    sourceLabel: "通い放題",
    currentMemberCount: 18,
    averageMonthlyFee: 16800,
    monthlyChurnRate: 2.2,
    currentMonthlyNewMemberCount: 1,
    adjustedMonthlyNewMemberCount: 2,
    adjustedAverageMonthlyFee: 17800,
    adjustedMonthlyChurnRate: 2,
    adjustedMonthlyAdSpend: 70000,
  },
  {
    id: "exam",
    name: "受験生",
    sourceLabel: "短期集中",
    currentMemberCount: 10,
    averageMonthlyFee: 24000,
    monthlyChurnRate: 8,
    currentMonthlyNewMemberCount: 0,
    adjustedMonthlyNewMemberCount: 1,
    adjustedAverageMonthlyFee: 24000,
    adjustedMonthlyChurnRate: 7,
    adjustedMonthlyAdSpend: 20000,
  },
];

const initialValues: SetupGuideValues = {
  fiscalYear: new Date().getFullYear(),
  annualRevenueGoal: 14400000,
  annualOperatingProfitGoal: 2400000,
  yearEndMemberCountGoal: 110,
  annualAdSpendLimit: 1800000,
  monthlyFixedCostAmount: 650000,
  monthlyHeadOfficeCostAmount: 120000,
  variableCostRate: 8,
  trialBookingRate: 70,
  trialAttendanceRate: 80,
  enrollmentRate: 50,
  acceptableAdInvestmentRate: 30,
  selectedCostTemplates: ["rent", "staff", "payment_fee", "system"],
  memberGroups: initialMemberGroups,
};

export function meta() {
  return [
    { title: "収支計画 mock | MemberPulse" },
    { name: "description", content: "収支計画 mock" },
  ];
}

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("ja-JP");

const formatYen = (value: number) => yenFormatter.format(value);

const formatSignedYen = (value: number) => `${value >= 0 ? "+" : "-"}${formatYen(Math.abs(value))}`;

const formatSignedNumber = (value: number, suffix: string) =>
  `${value >= 0 ? "+" : "-"}${numberFormatter.format(Math.abs(value))}${suffix}`;

const toNumber = (value: string | number): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toRate = (value: number) => Math.max(value, 0) / 100;

const divideSafely = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0;

function buildFiscalYearRange(fiscalYear: number, fiscalYearStartMonth: number) {
  const startMonth = Math.min(Math.max(fiscalYearStartMonth, 1), 12);
  const endYear = startMonth === 1 ? fiscalYear : fiscalYear + 1;
  const endMonth = startMonth === 1 ? 12 : startMonth - 1;
  return `${fiscalYear}年${startMonth}月 - ${endYear}年${endMonth}月`;
}

function buildMemberGroupSummary(memberGroups: MemberGroupValues[]) {
  const currentMemberCount = memberGroups.reduce((sum, group) => sum + group.currentMemberCount, 0);
  const currentMonthlyRevenue = memberGroups.reduce(
    (sum, group) => sum + group.currentMemberCount * group.averageMonthlyFee,
    0,
  );
  const averageMonthlyFee = Math.round(divideSafely(currentMonthlyRevenue, currentMemberCount));
  const currentMonthlyNewMemberCount = memberGroups.reduce(
    (sum, group) => sum + group.currentMonthlyNewMemberCount,
    0,
  );
  const adjustedMonthlyNewMemberCount = memberGroups.reduce(
    (sum, group) => sum + group.adjustedMonthlyNewMemberCount,
    0,
  );
  const adjustedMonthlyAdSpend = memberGroups.reduce(
    (sum, group) => sum + group.adjustedMonthlyAdSpend,
    0,
  );

  return {
    adjustedMonthlyAdSpend,
    adjustedMonthlyNewMemberCount,
    averageMonthlyFee,
    currentMemberCount,
    currentMonthlyNewMemberCount,
    currentMonthlyRevenue,
  };
}

function buildSetupSummary(values: SetupGuideValues) {
  const memberSummary = buildMemberGroupSummary(values.memberGroups);
  const monthlyRevenueGoal = Math.round(values.annualRevenueGoal / 12);
  const monthlyOperatingProfitGoal = Math.round(values.annualOperatingProfitGoal / 12);
  const memberGrowthGoal = Math.max(
    values.yearEndMemberCountGoal - memberSummary.currentMemberCount,
    0,
  );
  const monthlyNewMemberGoal = Math.ceil(memberGrowthGoal / 12);
  const monthlyAdSpendLimit = Math.round(values.annualAdSpendLimit / 12);

  return {
    ...memberSummary,
    monthlyAdSpendLimit,
    monthlyNewMemberGoal,
    monthlyOperatingProfitGoal,
    monthlyRevenueGoal,
  };
}

function buildSimulation(values: SetupGuideValues) {
  const buildCase = (mode: "forecast" | "adjusted") => {
    const variableCostRate = toRate(values.variableCostRate);
    const trialBookingRate = toRate(values.trialBookingRate);
    const trialAttendanceRate = toRate(values.trialAttendanceRate);
    const enrollmentRate = toRate(values.enrollmentRate);
    const funnelRate = trialBookingRate * trialAttendanceRate * enrollmentRate;
    const beginningCounts = new Map(
      values.memberGroups.map((group) => [group.id, group.currentMemberCount]),
    );

    const months = Array.from({ length: 12 }, (_, index) => {
      const groupRows = values.memberGroups.map((group) => {
        const beginningMemberCount = beginningCounts.get(group.id) ?? 0;
        const monthlyNewMemberCount =
          mode === "forecast"
            ? group.currentMonthlyNewMemberCount
            : group.adjustedMonthlyNewMemberCount;
        const averageMonthlyFee =
          mode === "forecast" ? group.averageMonthlyFee : group.adjustedAverageMonthlyFee;
        const monthlyChurnRate =
          mode === "forecast" ? group.monthlyChurnRate : group.adjustedMonthlyChurnRate;
        const resignedMemberCount = Math.floor(beginningMemberCount * toRate(monthlyChurnRate));
        const endingMemberCount = Math.max(
          beginningMemberCount + monthlyNewMemberCount - resignedMemberCount,
          0,
        );
        const membershipRevenue = Math.round(endingMemberCount * averageMonthlyFee);
        beginningCounts.set(group.id, endingMemberCount);

        return {
          averageMonthlyFee,
          beginningMemberCount,
          endingMemberCount,
          groupId: group.id,
          groupName: group.name,
          membershipRevenue,
          monthlyChurnRate,
          monthlyNewMemberCount,
          resignedMemberCount,
        };
      });

      const totalRevenue = groupRows.reduce((sum, group) => sum + group.membershipRevenue, 0);
      const monthlyNewMemberCount = groupRows.reduce(
        (sum, group) => sum + group.monthlyNewMemberCount,
        0,
      );
      const resignedMemberCount = groupRows.reduce(
        (sum, group) => sum + group.resignedMemberCount,
        0,
      );
      const endingMemberCount = groupRows.reduce((sum, group) => sum + group.endingMemberCount, 0);
      const variableCost = Math.round(totalRevenue * variableCostRate);
      const monthlyAdSpend =
        mode === "forecast"
          ? Math.round(values.annualAdSpendLimit / 12)
          : values.memberGroups.reduce((sum, group) => sum + group.adjustedMonthlyAdSpend, 0);
      const operatingProfit =
        totalRevenue -
        variableCost -
        values.monthlyFixedCostAmount -
        values.monthlyHeadOfficeCostAmount -
        monthlyAdSpend;
      const inquiryCountGoal = Math.ceil(divideSafely(monthlyNewMemberCount, funnelRate));
      const trialBookingCountGoal = Math.ceil(inquiryCountGoal * trialBookingRate);
      const trialCompletedCountGoal = Math.ceil(trialBookingCountGoal * trialAttendanceRate);

      return {
        groupRows,
        index: index + 1,
        inquiryCountGoal,
        monthlyAdSpend,
        monthlyNewMemberCount,
        operatingProfit,
        resignedMemberCount,
        totalRevenue,
        trialBookingCountGoal,
        trialCompletedCountGoal,
        endingMemberCount,
      };
    });

    const totalRevenue = months.reduce((sum, month) => sum + month.totalRevenue, 0);
    const operatingProfit = months.reduce((sum, month) => sum + month.operatingProfit, 0);
    const newMemberCount = months.reduce((sum, month) => sum + month.monthlyNewMemberCount, 0);
    const resignedMemberCount = months.reduce((sum, month) => sum + month.resignedMemberCount, 0);
    const adSpendAmount = months.reduce((sum, month) => sum + month.monthlyAdSpend, 0);
    const endingMemberCount = months.at(-1)?.endingMemberCount ?? 0;
    const weightedAverageFee = Math.round(
      divideSafely(
        totalRevenue,
        months.reduce((sum, month) => sum + month.endingMemberCount, 0),
      ),
    );
    const averageChurnRate = divideSafely(
      resignedMemberCount,
      months.reduce((sum, month) => sum + month.endingMemberCount, 0),
    );
    const grossProfitPerMember = Math.round(weightedAverageFee * (1 - variableCostRate));
    const ltvChurnRate = Math.max(averageChurnRate, 0.01);
    const grossLtv = Math.round(grossProfitPerMember * (1 / ltvChurnRate));
    const marginalCpo = Math.round(grossLtv * toRate(values.acceptableAdInvestmentRate));

    return {
      adSpendAmount,
      cpo: Math.round(divideSafely(adSpendAmount, newMemberCount)),
      endingMemberCount,
      grossLtv,
      inquiryCountGoal: months.reduce((sum, month) => sum + month.inquiryCountGoal, 0),
      marginalCpo,
      months,
      newMemberCount,
      operatingProfit,
      resignedMemberCount,
      totalRevenue,
    };
  };

  return { adjusted: buildCase("adjusted"), forecast: buildCase("forecast") };
}

function SummaryTile({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "good" | "bad";
  value: string;
}) {
  const color = tone === "good" ? "teal" : tone === "bad" ? "red" : undefined;
  return (
    <Paper p="md" radius="sm" withBorder>
      <Stack gap={2}>
        <Text c="dimmed" fw={600} size="xs">
          {label}
        </Text>
        <Text c={color} fw={700}>
          {value}
        </Text>
      </Stack>
    </Paper>
  );
}

function SectionHeader({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Group align="flex-start" justify="space-between" wrap="nowrap">
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <ThemeIcon color="teal" radius="sm" variant="light">
          {icon}
        </ThemeIcon>
        <Stack gap={2}>
          <Text fw={700}>{title}</Text>
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        </Stack>
      </Group>
    </Group>
  );
}

function TimelineCard({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Paper p="lg" radius="sm" shadow="xs" withBorder>
      <Stack gap="md">
        <SectionHeader description={description} icon={icon} title={title} />
        <Divider />
        {children}
      </Stack>
    </Paper>
  );
}

function SimulationSummaryTiles({
  caseData,
  values,
}: {
  caseData: SimulationCase;
  values: SetupGuideValues;
}) {
  const memberGap = caseData.endingMemberCount - values.yearEndMemberCountGoal;
  const revenueGap = caseData.totalRevenue - values.annualRevenueGoal;
  const profitGap = caseData.operatingProfit - values.annualOperatingProfitGoal;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
      <SummaryTile
        label="年度末会員数"
        value={`${numberFormatter.format(caseData.endingMemberCount)}人`}
      />
      <SummaryTile label="年間売上" value={formatYen(caseData.totalRevenue)} />
      <SummaryTile label="年間営業利益" value={formatYen(caseData.operatingProfit)} />
      <SummaryTile
        label="想定CPO / 限界CPO"
        value={`${formatYen(caseData.cpo)} / ${formatYen(caseData.marginalCpo)}`}
      />
      <SummaryTile
        label="会員数ギャップ"
        tone={memberGap >= 0 ? "good" : "bad"}
        value={formatSignedNumber(memberGap, "人")}
      />
      <SummaryTile
        label="売上ギャップ"
        tone={revenueGap >= 0 ? "good" : "bad"}
        value={formatSignedYen(revenueGap)}
      />
      <SummaryTile
        label="営業利益ギャップ"
        tone={profitGap >= 0 ? "good" : "bad"}
        value={formatSignedYen(profitGap)}
      />
      <SummaryTile
        label="年間問い合わせ目標"
        value={`${numberFormatter.format(caseData.inquiryCountGoal)}件`}
      />
    </SimpleGrid>
  );
}

function MonthlyPlanTable({ forecast, plan }: { forecast?: SimulationCase; plan: SimulationCase }) {
  return (
    <Table.ScrollContainer minWidth={980}>
      <Table striped withColumnBorders withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>月</Table.Th>
            {forecast ? <Table.Th ta="right">成り行き売上</Table.Th> : null}
            <Table.Th ta="right">売上</Table.Th>
            <Table.Th ta="right">会員数</Table.Th>
            <Table.Th ta="right">入会</Table.Th>
            <Table.Th ta="right">退会</Table.Th>
            <Table.Th ta="right">問い合わせ</Table.Th>
            <Table.Th ta="right">広告費</Table.Th>
            <Table.Th ta="right">営業利益</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {plan.months.map((month, index) => {
            const forecastMonth = forecast?.months[index];
            return (
              <Table.Tr key={month.index}>
                <Table.Td>{month.index}か月目</Table.Td>
                {forecastMonth ? (
                  <Table.Td ta="right">{formatYen(forecastMonth.totalRevenue)}</Table.Td>
                ) : null}
                <Table.Td ta="right">{formatYen(month.totalRevenue)}</Table.Td>
                <Table.Td ta="right">{numberFormatter.format(month.endingMemberCount)}人</Table.Td>
                <Table.Td ta="right">
                  {numberFormatter.format(month.monthlyNewMemberCount)}人
                </Table.Td>
                <Table.Td ta="right">
                  {numberFormatter.format(month.resignedMemberCount)}人
                </Table.Td>
                <Table.Td ta="right">{numberFormatter.format(month.inquiryCountGoal)}件</Table.Td>
                <Table.Td ta="right">{formatYen(month.monthlyAdSpend)}</Table.Td>
                <Table.Td ta="right">{formatYen(month.operatingProfit)}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

// 収支計画 mock は、DB保存前に計画単位と計算体験を固めるための画面。
export default function SetupGuideV2IndexRoute() {
  const [values, setValues] = useState<SetupGuideValues>(initialValues);
  const [activeStep, setActiveStep] = useState<PlanStep>("goals");
  const fiscalYearRange = buildFiscalYearRange(
    values.fiscalYear,
    registeredMasterSummary.fiscalYearStartMonth,
  );
  const summary = useMemo(() => buildSetupSummary(values), [values]);
  const simulation = useMemo(() => buildSimulation(values), [values]);

  const updateNumberField = (field: keyof SetupGuideValues, value: string | number) => {
    // Mantine NumberInput の string/number を保存用の数値へ正規化する。
    setValues((current) => ({ ...current, [field]: toNumber(value) }));
  };

  const updateMemberGroupField = (
    groupId: string,
    field: keyof MemberGroupValues,
    value: string | number,
  ) => {
    // 会員グループ単位の仮説を更新し、成り行きと改善案へ即時反映する。
    setValues((current) => ({
      ...current,
      memberGroups: current.memberGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              [field]: typeof value === "string" && field === "name" ? value : toNumber(value),
            }
          : group,
      ),
    }));
  };

  const updateMemberGroupTextField = (
    groupId: string,
    field: "name" | "sourceLabel",
    value: string,
  ) => {
    // 分析単位名と元プラン名は、CRM連携後も表示に使う想定。
    setValues((current) => ({
      ...current,
      memberGroups: current.memberGroups.map((group) =>
        group.id === groupId ? { ...group, [field]: value } : group,
      ),
    }));
  };

  const addMemberGroup = () => {
    // mock上で会員グループ粒度を試せるよう、空の分析単位を追加する。
    setValues((current) => ({
      ...current,
      memberGroups: [
        ...current.memberGroups,
        {
          id: `group-${Date.now()}`,
          name: "新規グループ",
          sourceLabel: "手入力",
          currentMemberCount: 0,
          averageMonthlyFee: 10000,
          monthlyChurnRate: 3,
          currentMonthlyNewMemberCount: 0,
          adjustedMonthlyNewMemberCount: 1,
          adjustedAverageMonthlyFee: 10000,
          adjustedMonthlyChurnRate: 3,
          adjustedMonthlyAdSpend: 0,
        },
      ],
    }));
  };

  const removeMemberGroup = (groupId: string) => {
    // 最低1グループは残し、計算不能な空状態を避ける。
    setValues((current) => {
      if (current.memberGroups.length <= 1) return current;
      return {
        ...current,
        memberGroups: current.memberGroups.filter((group) => group.id !== groupId),
      };
    });
  };

  const toggleCostTemplate = (code: string, checked: boolean) => {
    // 選択されたテンプレートコードだけを保持し、cost_item作成の入力に使う想定。
    setValues((current) => {
      const selected = new Set(current.selectedCostTemplates);
      if (checked) selected.add(code);
      else selected.delete(code);
      return { ...current, selectedCostTemplates: Array.from(selected) };
    });
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
            <Text c="dimmed" size="sm">
              収支計画 mock
            </Text>
          </Group>
          <Title order={2}>収支計画 mock</Title>
          <Text c="dimmed" size="sm">
            会員グループ別の単価、退会率、獲得数を動かして、成り行きと改善案を比較します。
          </Text>
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="md">
        <SummaryTile label="計画期間" value={fiscalYearRange} />
        <SummaryTile
          label="現在会員数"
          value={`${numberFormatter.format(summary.currentMemberCount)}人`}
        />
        <SummaryTile label="現在月商" value={formatYen(summary.currentMonthlyRevenue)} />
        <SummaryTile label="平均月謝" value={formatYen(summary.averageMonthlyFee)} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 5 }} spacing="xs">
        {[
          { key: "goals" as const, label: "1. 目標", icon: <Target size={16} /> },
          { key: "groups" as const, label: "2. 会員グループ", icon: <Users size={16} /> },
          { key: "baseline" as const, label: "3. 成り行き", icon: <Calculator size={16} /> },
          {
            key: "adjustment" as const,
            label: "4. GAP調整",
            icon: <SlidersHorizontal size={16} />,
          },
          { key: "save" as const, label: "5. 保存確認", icon: <ClipboardCheck size={16} /> },
        ].map((step) => (
          <Button
            key={step.key}
            color={activeStep === step.key ? "teal" : "gray"}
            justify="flex-start"
            leftSection={step.icon}
            onClick={() => setActiveStep(step.key)}
            radius="sm"
            variant={activeStep === step.key ? "filled" : "light"}
          >
            {step.label}
          </Button>
        ))}
      </SimpleGrid>

      {activeStep === "goals" ? (
        <TimelineCard
          description="初期セットアップではなく、今年どう売上と利益を作るかの計画条件を置きます。"
          icon={<Target size={18} />}
          title="目標と共通前提"
        >
          <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
            <Paper p="md" radius="sm" withBorder>
              <Stack gap="md">
                <SectionHeader
                  description="初期セットアップで整備済みのマスタを使って、今年の計画だけを作ります。"
                  icon={<CalendarDays size={18} />}
                  title="計画期間と使用マスタ"
                />
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <NumberInput
                    allowDecimal={false}
                    label="計画年度"
                    min={2000}
                    onChange={(value) => updateNumberField("fiscalYear", value)}
                    value={values.fiscalYear}
                  />
                  <Stack gap={2}>
                    <Text c="dimmed" fw={600} size="xs">
                      年度開始月
                    </Text>
                    <Text fw={700}>{registeredMasterSummary.fiscalYearStartMonth}月</Text>
                    <Text c="dimmed" size="xs">
                      事業プロフィールの設定を使います。
                    </Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text c="dimmed" fw={600} size="xs">
                      事業
                    </Text>
                    <Text fw={700}>{registeredMasterSummary.businessName}</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text c="dimmed" fw={600} size="xs">
                      計画単位
                    </Text>
                    <Text fw={700}>{registeredMasterSummary.planningScope}</Text>
                  </Stack>
                </SimpleGrid>
                <Group gap="xs">
                  <Badge color="teal" radius="sm" variant="light">
                    会員プラン {registeredMasterSummary.membershipPlans.length}件
                  </Badge>
                  <Badge color="blue" radius="sm" variant="light">
                    販管費項目 {registeredMasterSummary.costItems.length}件
                  </Badge>
                </Group>
              </Stack>
            </Paper>

            <Paper p="md" radius="sm" withBorder>
              <Stack gap="md">
                <SectionHeader
                  description="成り行きと改善案を比べる基準になる年度目標です。"
                  icon={<Target size={18} />}
                  title="年度目標"
                />
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
                    onChange={(value) => updateNumberField("annualOperatingProfitGoal", value)}
                    prefix="¥"
                    thousandSeparator=","
                    value={values.annualOperatingProfitGoal}
                  />
                  <NumberInput
                    allowDecimal={false}
                    label="年度末会員数目標"
                    min={0}
                    onChange={(value) => updateNumberField("yearEndMemberCountGoal", value)}
                    suffix="人"
                    value={values.yearEndMemberCountGoal}
                  />
                  <NumberInput
                    allowDecimal={false}
                    label="年間広告費上限"
                    min={0}
                    onChange={(value) => updateNumberField("annualAdSpendLimit", value)}
                    prefix="¥"
                    thousandSeparator=","
                    value={values.annualAdSpendLimit}
                  />
                </SimpleGrid>
              </Stack>
            </Paper>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
            <Paper p="md" radius="sm" withBorder>
              <Stack gap="md">
                <SectionHeader
                  description="問い合わせから入会までの歩留まりです。入会数から必要問い合わせ数を逆算します。"
                  icon={<Percent size={18} />}
                  title="集客ファネル"
                />
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
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
                  <NumberInput
                    label="許容広告投資率"
                    min={0}
                    onChange={(value) => updateNumberField("acceptableAdInvestmentRate", value)}
                    suffix="%"
                    value={values.acceptableAdInvestmentRate}
                  />
                </SimpleGrid>
              </Stack>
            </Paper>

            <Paper p="md" radius="sm" withBorder>
              <Stack gap="md">
                <SectionHeader
                  description="営業利益と限界CPOを見るための費用です。後で明細管理へ分ける想定です。"
                  icon={<BadgeJapaneseYen size={18} />}
                  title="費用・広告"
                />
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <NumberInput
                    allowDecimal={false}
                    label="店舗固定費"
                    min={0}
                    onChange={(value) => updateNumberField("monthlyFixedCostAmount", value)}
                    prefix="¥"
                    thousandSeparator=","
                    value={values.monthlyFixedCostAmount}
                  />
                  <NumberInput
                    allowDecimal={false}
                    label="本部経費"
                    min={0}
                    onChange={(value) => updateNumberField("monthlyHeadOfficeCostAmount", value)}
                    prefix="¥"
                    thousandSeparator=","
                    value={values.monthlyHeadOfficeCostAmount}
                  />
                  <NumberInput
                    label="変動費率"
                    min={0}
                    onChange={(value) => updateNumberField("variableCostRate", value)}
                    suffix="%"
                    value={values.variableCostRate}
                  />
                </SimpleGrid>
              </Stack>
            </Paper>
          </SimpleGrid>

          <Group justify="flex-end">
            <Button onClick={() => setActiveStep("groups")}>会員グループを整える</Button>
          </Group>
        </TimelineCard>
      ) : null}

      {activeStep === "groups" ? (
        <TimelineCard
          description="平均単価だけで潰さず、単価や退会タイミングが違う会員を計画上の分析単位に分けます。"
          icon={<Users size={18} />}
          title="既存会員グループ"
        >
          <Paper p="md" radius="sm" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <SectionHeader
                  description="CRM連携後は membership_plan や subscription から候補を作り、ここで計画単位へ畳みます。"
                  icon={<Users size={18} />}
                  title="グループ別の現在値"
                />
                <Button leftSection={<Plus size={16} />} onClick={addMemberGroup} variant="light">
                  グループ追加
                </Button>
              </Group>
              <Table.ScrollContainer minWidth={1120}>
                <Table withColumnBorders withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>会員グループ</Table.Th>
                      <Table.Th>元プラン/区分</Table.Th>
                      <Table.Th ta="right">現在会員</Table.Th>
                      <Table.Th ta="right">平均月謝</Table.Th>
                      <Table.Th ta="right">月次退会率</Table.Th>
                      <Table.Th ta="right">現状入会</Table.Th>
                      <Table.Th ta="right">現在月商</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {values.memberGroups.map((group) => (
                      <Table.Tr key={group.id}>
                        <Table.Td miw={180}>
                          <TextInput
                            value={group.name}
                            onChange={(event) =>
                              updateMemberGroupTextField(
                                group.id,
                                "name",
                                event.currentTarget.value,
                              )
                            }
                          />
                        </Table.Td>
                        <Table.Td miw={160}>
                          <TextInput
                            value={group.sourceLabel}
                            onChange={(event) =>
                              updateMemberGroupTextField(
                                group.id,
                                "sourceLabel",
                                event.currentTarget.value,
                              )
                            }
                          />
                        </Table.Td>
                        <Table.Td miw={120}>
                          <NumberInput
                            allowDecimal={false}
                            min={0}
                            onChange={(value) =>
                              updateMemberGroupField(group.id, "currentMemberCount", value)
                            }
                            suffix="人"
                            value={group.currentMemberCount}
                          />
                        </Table.Td>
                        <Table.Td miw={140}>
                          <NumberInput
                            allowDecimal={false}
                            min={0}
                            onChange={(value) =>
                              updateMemberGroupField(group.id, "averageMonthlyFee", value)
                            }
                            prefix="¥"
                            thousandSeparator=","
                            value={group.averageMonthlyFee}
                          />
                        </Table.Td>
                        <Table.Td miw={130}>
                          <NumberInput
                            min={0}
                            onChange={(value) =>
                              updateMemberGroupField(group.id, "monthlyChurnRate", value)
                            }
                            suffix="%"
                            value={group.monthlyChurnRate}
                          />
                        </Table.Td>
                        <Table.Td miw={130}>
                          <NumberInput
                            allowDecimal={false}
                            min={0}
                            onChange={(value) =>
                              updateMemberGroupField(
                                group.id,
                                "currentMonthlyNewMemberCount",
                                value,
                              )
                            }
                            suffix="人/月"
                            value={group.currentMonthlyNewMemberCount}
                          />
                        </Table.Td>
                        <Table.Td ta="right" miw={130}>
                          {formatYen(group.currentMemberCount * group.averageMonthlyFee)}
                        </Table.Td>
                        <Table.Td ta="center">
                          <ActionIcon
                            aria-label="会員グループを削除"
                            color="red"
                            disabled={values.memberGroups.length <= 1}
                            onClick={() => removeMemberGroup(group.id)}
                            variant="subtle"
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Stack>
          </Paper>

          <Paper p="md" radius="sm" withBorder>
            <Stack gap="md">
              <SectionHeader
                description="費用明細化する時に使う候補です。今はmockとして、選択状態だけ保持します。"
                icon={<BadgeJapaneseYen size={18} />}
                title="費用テンプレート"
              />
              <SimpleGrid cols={{ base: 1, sm: 2, xl: 5 }} spacing="md">
                {costTemplateOptions.map((option) => (
                  <Paper key={option.code} p="md" radius="sm" withBorder>
                    <Checkbox
                      checked={values.selectedCostTemplates.includes(option.code)}
                      description={option.description}
                      label={
                        <Stack gap={4}>
                          <Text fw={700}>{option.label}</Text>
                          <Group gap="xs">
                            <Badge
                              color={option.costType === "fixed" ? "blue" : "teal"}
                              radius="sm"
                              variant="light"
                            >
                              {option.costType === "fixed" ? "固定費" : "変動費"}
                            </Badge>
                            <Badge
                              color={option.scope === "head_office" ? "grape" : "gray"}
                              radius="sm"
                              variant="light"
                            >
                              {option.scope === "head_office" ? "本部" : "店舗"}
                            </Badge>
                          </Group>
                        </Stack>
                      }
                      onChange={(event) =>
                        toggleCostTemplate(option.code, event.currentTarget.checked)
                      }
                    />
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>
          </Paper>

          <Group justify="space-between">
            <Button onClick={() => setActiveStep("goals")} variant="light">
              目標へ戻る
            </Button>
            <Button onClick={() => setActiveStep("baseline")}>成り行きを見る</Button>
          </Group>
        </TimelineCard>
      ) : null}

      {activeStep === "baseline" ? (
        <TimelineCard
          description="今の会員構成、単価、退会率、獲得ペースを続けた場合の自然な結果です。"
          icon={<Calculator size={18} />}
          title="成り行きを見る"
        >
          <SimulationSummaryTiles caseData={simulation.forecast} values={values} />
          <Paper p="md" radius="sm" withBorder>
            <Stack gap="md">
              <SectionHeader
                description="改善レバーを触る前に、現状ペースの月別推移と不足幅を確認します。"
                icon={<NotebookTabs size={18} />}
                title="成り行きの月別推移"
              />
              <MonthlyPlanTable plan={simulation.forecast} />
            </Stack>
          </Paper>
          <Group justify="space-between">
            <Button onClick={() => setActiveStep("groups")} variant="light">
              会員グループへ戻る
            </Button>
            <Button onClick={() => setActiveStep("adjustment")}>GAPを調整する</Button>
          </Group>
        </TimelineCard>
      ) : null}

      {activeStep === "adjustment" ? (
        <TimelineCard
          description="会員グループごとに、入会数、退会率、単価、広告費を動かして目標との差分を埋めます。"
          icon={<SlidersHorizontal size={18} />}
          title="GAP調整"
        >
          <Paper p="md" radius="sm" withBorder>
            <Stack gap="md">
              <SectionHeader
                description="通常会員と上級会員、短期会員では単価も退会率も違うため、調整レバーも分けて持ちます。"
                icon={<SlidersHorizontal size={18} />}
                title="グループ別の改善レバー"
              />
              <Table.ScrollContainer minWidth={1080}>
                <Table withColumnBorders withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>会員グループ</Table.Th>
                      <Table.Th ta="right">月間入会</Table.Th>
                      <Table.Th ta="right">改善後単価</Table.Th>
                      <Table.Th ta="right">改善後退会率</Table.Th>
                      <Table.Th ta="right">月間広告費</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {values.memberGroups.map((group) => (
                      <Table.Tr key={group.id}>
                        <Table.Td>
                          <Stack gap={0}>
                            <Text fw={700}>{group.name}</Text>
                            <Text c="dimmed" size="xs">
                              {group.sourceLabel}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td miw={140}>
                          <NumberInput
                            allowDecimal={false}
                            min={0}
                            onChange={(value) =>
                              updateMemberGroupField(
                                group.id,
                                "adjustedMonthlyNewMemberCount",
                                value,
                              )
                            }
                            suffix="人/月"
                            value={group.adjustedMonthlyNewMemberCount}
                          />
                        </Table.Td>
                        <Table.Td miw={150}>
                          <NumberInput
                            allowDecimal={false}
                            min={0}
                            onChange={(value) =>
                              updateMemberGroupField(group.id, "adjustedAverageMonthlyFee", value)
                            }
                            prefix="¥"
                            thousandSeparator=","
                            value={group.adjustedAverageMonthlyFee}
                          />
                        </Table.Td>
                        <Table.Td miw={150}>
                          <NumberInput
                            min={0}
                            onChange={(value) =>
                              updateMemberGroupField(group.id, "adjustedMonthlyChurnRate", value)
                            }
                            suffix="%"
                            value={group.adjustedMonthlyChurnRate}
                          />
                        </Table.Td>
                        <Table.Td miw={160}>
                          <NumberInput
                            allowDecimal={false}
                            min={0}
                            onChange={(value) =>
                              updateMemberGroupField(group.id, "adjustedMonthlyAdSpend", value)
                            }
                            prefix="¥"
                            thousandSeparator=","
                            value={group.adjustedMonthlyAdSpend}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Stack>
          </Paper>

          <SimulationSummaryTiles caseData={simulation.adjusted} values={values} />

          <Paper p="md" radius="sm" withBorder>
            <Stack gap="md">
              <SectionHeader
                description="採用する改善案の月別KPIです。次の保存ステップで、この値を年度計画として扱います。"
                icon={<NotebookTabs size={18} />}
                title="改善案の月別KPI"
              />
              <MonthlyPlanTable forecast={simulation.forecast} plan={simulation.adjusted} />
            </Stack>
          </Paper>
          <Group justify="space-between">
            <Button onClick={() => setActiveStep("baseline")} variant="light">
              成り行きへ戻る
            </Button>
            <Button onClick={() => setActiveStep("save")}>計画として保存へ</Button>
          </Group>
        </TimelineCard>
      ) : null}

      {activeStep === "save" ? (
        <TimelineCard
          description="採用する改善案を年度計画として保存する前の確認です。今はmockなので保存接続はまだ行いません。"
          icon={<ClipboardCheck size={18} />}
          title="計画として保存"
        >
          <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
            <SummaryTile label="事業" value={registeredMasterSummary.businessName} />
            <SummaryTile label="計画単位" value={registeredMasterSummary.planningScope} />
            <SummaryTile label="会員グループ" value={`${values.memberGroups.length}件`} />
            <SummaryTile
              label="改善案 年度末会員数"
              value={`${numberFormatter.format(simulation.adjusted.endingMemberCount)}人`}
            />
            <SummaryTile
              label="改善案 年間売上"
              value={formatYen(simulation.adjusted.totalRevenue)}
            />
            <SummaryTile
              label="改善案 年間営業利益"
              value={formatYen(simulation.adjusted.operatingProfit)}
            />
            <SummaryTile
              label="年間問い合わせ目標"
              value={`${numberFormatter.format(simulation.adjusted.inquiryCountGoal)}件`}
            />
            <SummaryTile label="選択した費用" value={`${values.selectedCostTemplates.length}件`} />
          </SimpleGrid>

          <Paper p="md" radius="sm" withBorder>
            <Stack gap="md">
              <SectionHeader
                description="goal_plan_member_group と goal_plan_month_member_group に落とす想定の粒度です。"
                icon={<Users size={18} />}
                title="保存予定の会員グループ"
              />
              <Table.ScrollContainer minWidth={780}>
                <Table striped withColumnBorders withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>会員グループ</Table.Th>
                      <Table.Th ta="right">現在会員</Table.Th>
                      <Table.Th ta="right">改善後月間入会</Table.Th>
                      <Table.Th ta="right">改善後単価</Table.Th>
                      <Table.Th ta="right">改善後退会率</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {values.memberGroups.map((group) => (
                      <Table.Tr key={group.id}>
                        <Table.Td>{group.name}</Table.Td>
                        <Table.Td ta="right">
                          {numberFormatter.format(group.currentMemberCount)}人
                        </Table.Td>
                        <Table.Td ta="right">
                          {numberFormatter.format(group.adjustedMonthlyNewMemberCount)}人/月
                        </Table.Td>
                        <Table.Td ta="right">{formatYen(group.adjustedAverageMonthlyFee)}</Table.Td>
                        <Table.Td ta="right">{group.adjustedMonthlyChurnRate}%</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Stack>
          </Paper>

          <Paper bg="teal.0" p="md" radius="sm" withBorder>
            <Group align="flex-start" gap="sm">
              <ThemeIcon color="teal" radius="xl" variant="filled">
                <Check size={16} />
              </ThemeIcon>
              <Stack gap={4}>
                <Text fw={700}>次の実装でDB保存へ接続します</Text>
                <Text c="dimmed" size="sm">
                  改善案を goal_plan、goal_plan_member_group、12か月分の
                  goal_plan_month、goal_plan_month_member_group
                  に保存し、月次レビューの比較対象にします。
                </Text>
              </Stack>
            </Group>
          </Paper>
          <Group justify="space-between">
            <Button onClick={() => setActiveStep("adjustment")} variant="light">
              GAP調整へ戻る
            </Button>
            <Button component={Link} leftSection={<NotebookTabs size={16} />} to="/monthly-reviews">
              月次レビューへ進む
            </Button>
          </Group>
        </TimelineCard>
      ) : null}
    </Stack>
  );
}
