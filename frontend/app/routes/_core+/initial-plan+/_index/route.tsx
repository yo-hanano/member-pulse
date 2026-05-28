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
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  BadgeJapaneseYen,
  CalendarDays,
  Check,
  CircleHelp,
  ClipboardCheck,
  MapPin,
  NotebookTabs,
  Percent,
  Target,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

type SetupGuideValues = {
  fiscalYear: number;
  businessName: string;
  industryType: string;
  fiscalYearStartMonth: number;
  defaultLocationName: string;
  currentMemberCount: number;
  averageMonthlyFee: number;
  annualRevenueGoal: number;
  annualOperatingProfitGoal: number;
  yearEndMemberCountGoal: number;
  annualAdSpendLimit: number;
  acceptableChurnRate: number;
  trialBookingRate: number;
  trialAttendanceRate: number;
  enrollmentRate: number;
  acceptableAdInvestmentRate: number;
  selectedCostTemplates: string[];
};

type CostTemplateOption = {
  code: string;
  label: string;
  description: string;
  costType: "fixed" | "variable";
  scope: "location_direct" | "head_office";
};

const fiscalMonthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}月`,
}));

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

const initialValues: SetupGuideValues = {
  fiscalYear: new Date().getFullYear(),
  businessName: "",
  industryType: "studio",
  fiscalYearStartMonth: 4,
  defaultLocationName: "メインスタジオ",
  currentMemberCount: 80,
  averageMonthlyFee: 12000,
  annualRevenueGoal: 14400000,
  annualOperatingProfitGoal: 2400000,
  yearEndMemberCountGoal: 110,
  annualAdSpendLimit: 1800000,
  acceptableChurnRate: 3,
  trialBookingRate: 70,
  trialAttendanceRate: 80,
  enrollmentRate: 50,
  acceptableAdInvestmentRate: 30,
  selectedCostTemplates: ["rent", "staff", "payment_fee", "system"],
};

export function meta() {
  return [{ title: "初年度計画 | MemberPulse" }, { name: "description", content: "初年度計画" }];
}

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("ja-JP");

const formatYen = (value: number) => yenFormatter.format(value);

const toNumber = (value: string | number): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function buildFiscalYearRange(fiscalYear: number, fiscalYearStartMonth: number) {
  const startMonth = Math.min(Math.max(fiscalYearStartMonth, 1), 12);
  const endYear = startMonth === 1 ? fiscalYear : fiscalYear + 1;
  const endMonth = startMonth === 1 ? 12 : startMonth - 1;
  return `${fiscalYear}年${startMonth}月 - ${endYear}年${endMonth}月`;
}

function buildSetupSummary(values: SetupGuideValues) {
  const monthlyRevenueGoal = Math.round(values.annualRevenueGoal / 12);
  const monthlyOperatingProfitGoal = Math.round(values.annualOperatingProfitGoal / 12);
  const memberGrowthGoal = Math.max(values.yearEndMemberCountGoal - values.currentMemberCount, 0);
  const monthlyNewMemberGoal = Math.ceil(memberGrowthGoal / 12);
  const monthlyAdSpendLimit = Math.round(values.annualAdSpendLimit / 12);
  const monthlyResignedLimit = Math.floor(
    values.currentMemberCount * (values.acceptableChurnRate / 100),
  );

  return {
    monthlyRevenueGoal,
    monthlyOperatingProfitGoal,
    monthlyNewMemberGoal,
    monthlyAdSpendLimit,
    monthlyResignedLimit,
  };
}

function TooltipLabel({
  required,
  text,
  tooltipText,
}: {
  required?: boolean;
  text: string;
  tooltipText: ReactNode;
}) {
  return (
    <Group gap={4} wrap="nowrap">
      <Group gap={2} wrap="nowrap">
        <Text fw={500} size="sm">
          {text}
        </Text>
        {required ? (
          <Text c="red" component="span" fw={700} size="sm">
            *
          </Text>
        ) : null}
      </Group>
      <Tooltip label={tooltipText} maw={300} multiline withArrow>
        <ActionIcon
          aria-label={`${text}の説明`}
          color="gray"
          radius="xl"
          size="xs"
          variant="subtle"
        >
          <CircleHelp size={14} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <Paper p="md" radius="sm" withBorder>
      <Stack gap={2}>
        <Text c="dimmed" fw={600} size="xs">
          {label}
        </Text>
        <Text fw={700}>{value}</Text>
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

// 初年度計画は、入力をページ遷移させず計画前提を1ページで俯瞰する画面。
export default function SetupGuideV2IndexRoute() {
  const [values, setValues] = useState<SetupGuideValues>(initialValues);
  const fiscalYearRange = buildFiscalYearRange(values.fiscalYear, values.fiscalYearStartMonth);
  const summary = useMemo(() => buildSetupSummary(values), [values]);

  const updateField = (field: keyof SetupGuideValues, value: string) => {
    // テキスト系の入力値は、確認カードと後続保存入力の両方に使う。
    setValues((current) => ({ ...current, [field]: value }));
  };

  const updateNumberField = (field: keyof SetupGuideValues, value: string | number) => {
    // Mantine NumberInput の string/number を保存用の数値へ正規化する。
    setValues((current) => ({ ...current, [field]: toNumber(value) }));
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
              初年度計画
            </Text>
          </Group>
          <Title order={2}>初年度計画</Title>
          <Text c="dimmed" size="sm">
            現状と目標をもとに、月次レビューで使う年度計画を作成します。
          </Text>
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="md">
        <SummaryTile label="計画期間" value={fiscalYearRange} />
        <SummaryTile label="月次売上目標" value={formatYen(summary.monthlyRevenueGoal)} />
        <SummaryTile
          label="月次営業利益目標"
          value={formatYen(summary.monthlyOperatingProfitGoal)}
        />
        <SummaryTile
          label="月次入会目標"
          value={`${numberFormatter.format(summary.monthlyNewMemberGoal)}人`}
        />
      </SimpleGrid>

      <Timeline active={3} bulletSize={38} color="teal" lineWidth={2}>
        <Timeline.Item bullet={<CalendarDays size={18} />} title="事業・店舗">
          <TimelineCard
            description="事業プロフィール、計画年度、最初の店舗をまとめて設定します。"
            icon={<CalendarDays size={18} />}
            title="事業・年度・店舗"
          >
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              <Paper p="md" radius="sm" withBorder>
                <Stack gap="md">
                  <SectionHeader
                    description="初年度計画で使う年度単位の基本情報です。"
                    icon={<CalendarDays size={18} />}
                    title="事業と年度"
                  />
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                      label={
                        <TooltipLabel
                          required
                          text="事業名"
                          tooltipText="画面表示や月次レビューで使う事業名です。会社名と店舗ブランド名が違う場合は、ユーザーに見せたい名称を入れます。"
                        />
                      }
                      onChange={(event) => updateField("businessName", event.currentTarget.value)}
                      placeholder="例: Member Pilates"
                      value={values.businessName}
                    />

                    <NumberInput
                      allowDecimal={false}
                      label={
                        <TooltipLabel
                          text="計画年度"
                          tooltipText="初年度計画で作る目標計画の年度です。年度開始月と組み合わせて12か月分の月別目標を作ります。"
                        />
                      }
                      min={2000}
                      onChange={(value) => updateNumberField("fiscalYear", value)}
                      value={values.fiscalYear}
                    />
                    <Select
                      data={fiscalMonthOptions}
                      label={
                        <TooltipLabel
                          text="年度開始月"
                          tooltipText="年度の1か月目です。4月開始なら、計画期間は4月から翌年3月までになります。"
                        />
                      }
                      onChange={(value) => updateNumberField("fiscalYearStartMonth", value ?? "4")}
                      value={String(values.fiscalYearStartMonth)}
                    />
                    <Select
                      data={[
                        { value: "studio", label: "スタジオ" },
                        { value: "gym", label: "ジム" },
                        { value: "language_school", label: "語学スクール" },
                        { value: "common", label: "その他" },
                      ]}
                      label={
                        <TooltipLabel
                          text="業種"
                          tooltipText="費用テンプレートや初期値の候補を出すための分類です。後から変更できます。"
                        />
                      }
                      onChange={(value) => updateField("industryType", value ?? "studio")}
                      value={values.industryType}
                    />
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Stack gap="md">
                  <SectionHeader
                    description="月次レビューの入力を紐づける店舗です。"
                    icon={<MapPin size={18} />}
                    title="最初の店舗"
                  />
                  <TextInput
                    label={
                      <TooltipLabel
                        required
                        text="店舗名"
                        tooltipText="月次レビューの入力を紐づける最初の店舗名です。1店舗でも必ず登録します。"
                      />
                    }
                    onChange={(event) =>
                      updateField("defaultLocationName", event.currentTarget.value)
                    }
                    value={values.defaultLocationName}
                  />
                  <Paper bg="gray.0" p="md" radius="sm" withBorder>
                    <Stack gap={2}>
                      <Text c="dimmed" fw={600} size="xs">
                        計画期間
                      </Text>
                      <Text fw={700}>{fiscalYearRange}</Text>
                    </Stack>
                  </Paper>
                </Stack>
              </Paper>
            </SimpleGrid>
          </TimelineCard>
        </Timeline.Item>

        <Timeline.Item bullet={<Target size={18} />} title="現状・目標">
          <TimelineCard
            description="現状と年度目標を同じ場所で見ながら、月別目標の初期値を作ります。"
            icon={<Target size={18} />}
            title="現状・年度目標"
          >
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              <Paper p="md" radius="sm" withBorder>
                <Stack gap="md">
                  <SectionHeader
                    description="年度目標を逆算するための現在の状態です。"
                    icon={<Users size={18} />}
                    title="現状"
                  />
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <NumberInput
                      allowDecimal={false}
                      label={
                        <TooltipLabel
                          text="現在会員数"
                          tooltipText="計画開始時点の在籍会員数です。年度末会員数目標や退会数上限の基準に使います。"
                        />
                      }
                      min={0}
                      onChange={(value) => updateNumberField("currentMemberCount", value)}
                      suffix="人"
                      value={values.currentMemberCount}
                    />
                    <NumberInput
                      allowDecimal={false}
                      label={
                        <TooltipLabel
                          text="平均月謝"
                          tooltipText="現在の月額プラン単価の平均です。月謝売上、LTV、限界CPOの計算に使います。"
                        />
                      }
                      min={0}
                      onChange={(value) => updateNumberField("averageMonthlyFee", value)}
                      prefix="¥"
                      thousandSeparator=","
                      value={values.averageMonthlyFee}
                    />
                    <NumberInput
                      label={
                        <TooltipLabel
                          text="現状の月次退会率"
                          tooltipText="現在の退会ペースの目安です。LTV、平均継続月数、年度目標の初期逆算に使います。"
                        />
                      }
                      min={0}
                      onChange={(value) => updateNumberField("acceptableChurnRate", value)}
                      suffix="%"
                      value={values.acceptableChurnRate}
                    />
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper p="md" radius="sm" withBorder>
                <Stack gap="md">
                  <SectionHeader
                    description="年度目標を入れると、月次レビュー用の月別目標へ展開できます。"
                    icon={<Target size={18} />}
                    title="年間目標"
                  />
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <NumberInput
                      allowDecimal={false}
                      label={
                        <TooltipLabel
                          text="年間売上目標"
                          tooltipText="この年度で目指す総売上です。初期値では12か月に均等配分して月別目標を作ります。"
                        />
                      }
                      min={0}
                      onChange={(value) => updateNumberField("annualRevenueGoal", value)}
                      prefix="¥"
                      thousandSeparator=","
                      value={values.annualRevenueGoal}
                    />
                    <NumberInput
                      allowDecimal={false}
                      label={
                        <TooltipLabel
                          text="年間営業利益目標"
                          tooltipText="この年度で残したい営業利益です。PLの目標差分判定に使います。"
                        />
                      }
                      min={0}
                      onChange={(value) => updateNumberField("annualOperatingProfitGoal", value)}
                      prefix="¥"
                      thousandSeparator=","
                      value={values.annualOperatingProfitGoal}
                    />
                    <NumberInput
                      allowDecimal={false}
                      label={
                        <TooltipLabel
                          text="年度末会員数目標"
                          tooltipText="計画年度の最後の月に到達したい会員数です。月別の入会目標の目安になります。"
                        />
                      }
                      min={values.currentMemberCount}
                      onChange={(value) => updateNumberField("yearEndMemberCountGoal", value)}
                      suffix="人"
                      value={values.yearEndMemberCountGoal}
                    />
                    <NumberInput
                      allowDecimal={false}
                      label={
                        <TooltipLabel
                          text="年間広告費上限"
                          tooltipText="この年度に使える広告費の上限です。月別広告費上限とCPO判断の基準に使います。"
                        />
                      }
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
          </TimelineCard>
        </Timeline.Item>

        <Timeline.Item bullet={<Percent size={18} />} title="集客・費用">
          <TimelineCard
            description="月次レビューでPL、CPO、LTV、重要成功要因を判定するための補助前提です。"
            icon={<Percent size={18} />}
            title="集客ファネル前提・費用"
          >
            <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
              <Paper p="md" radius="sm" withBorder>
                <Stack gap="md">
                  <SectionHeader
                    description="問い合わせから体験予約、体験実施、入会までの流れをファネルとして見ます。各率は必要な問い合わせ数や入会数の逆算に使います。"
                    icon={<Percent size={18} />}
                    title="集客ファネル前提"
                  />
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <NumberInput
                      label={
                        <TooltipLabel
                          text="体験予約率"
                          tooltipText="問い合わせのうち体験予約につながる想定割合です。必要問い合わせ数の逆算に使います。"
                        />
                      }
                      min={0}
                      onChange={(value) => updateNumberField("trialBookingRate", value)}
                      suffix="%"
                      value={values.trialBookingRate}
                    />
                    <NumberInput
                      label={
                        <TooltipLabel
                          text="体験実施率"
                          tooltipText="体験予約のうち実際に来店・実施される想定割合です。ファネル目標の逆算に使います。"
                        />
                      }
                      min={0}
                      onChange={(value) => updateNumberField("trialAttendanceRate", value)}
                      suffix="%"
                      value={values.trialAttendanceRate}
                    />
                    <NumberInput
                      label={
                        <TooltipLabel
                          text="入会率"
                          tooltipText="体験実施から入会につながる想定割合です。入会数不足の要因判定に使います。"
                        />
                      }
                      min={0}
                      onChange={(value) => updateNumberField("enrollmentRate", value)}
                      suffix="%"
                      value={values.enrollmentRate}
                    />
                    <NumberInput
                      label={
                        <TooltipLabel
                          text="許容広告投資率"
                          tooltipText="粗利LTVのうち広告費として投資してよい割合です。限界CPOの計算に使います。"
                        />
                      }
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
                    description="利用頻度が高い費用をあらかじめ用意しています。選択しておくと費用マスタへの登録の手間を省けます。独自費用はあとから追加・変更できます。"
                    icon={<BadgeJapaneseYen size={18} />}
                    title="費用テンプレート"
                  />
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
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
            </SimpleGrid>
          </TimelineCard>
        </Timeline.Item>

        <Timeline.Item bullet={<ClipboardCheck size={18} />} title="確認">
          <TimelineCard
            description="この内容を保存すると、月次レビュー入力に進むための前提が揃います。"
            icon={<ClipboardCheck size={18} />}
            title="確認"
          >
            <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
              <SummaryTile label="事業名" value={values.businessName || "未入力"} />
              <SummaryTile label="店舗" value={values.defaultLocationName || "未入力"} />
              <SummaryTile label="年度末会員数目標" value={`${values.yearEndMemberCountGoal}人`} />
              <SummaryTile
                label="選択した費用"
                value={`${values.selectedCostTemplates.length}件`}
              />
            </SimpleGrid>
            <Paper bg="teal.0" p="md" radius="sm" withBorder>
              <Group align="flex-start" gap="sm">
                <ThemeIcon color="teal" radius="xl" variant="filled">
                  <Check size={16} />
                </ThemeIcon>
                <Stack gap={4}>
                  <Text fw={700}>次の実装でDB保存へ接続します</Text>
                  <Text c="dimmed" size="sm">
                    この内容から business_profile、既定 location、goal_plan、12か月分の
                    goal_plan_month、cost_item を作成します。
                  </Text>
                </Stack>
              </Group>
            </Paper>
            <Group justify="flex-end">
              <Button
                component={Link}
                leftSection={<NotebookTabs size={16} />}
                to="/monthly-reviews"
              >
                月次レビューへ進む
              </Button>
            </Group>
          </TimelineCard>
        </Timeline.Item>
      </Timeline>
    </Stack>
  );
}
