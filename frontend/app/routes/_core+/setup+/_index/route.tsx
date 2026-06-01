import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
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
  Building2,
  Check,
  CreditCard,
  NotebookTabs,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

type MembershipPlanDraft = {
  id: string;
  name: string;
  monthlyFee: number;
  usageLabel: string;
};

type CostItemType = "fixed" | "variable";
type CostItemScope = "company" | "head_office" | "location";
type CostDriver =
  | "fixed"
  | "revenue"
  | "member_count"
  | "new_members"
  | "lead_count"
  | "trial_count"
  | "location_count"
  | "staff_count";

type CostTemplateDraft = {
  code: string;
  name: string;
  costType: CostItemType;
  scope: CostItemScope;
  costDriver: CostDriver;
  defaultAmount: number | null;
  enabled: boolean;
};

type CustomCostItemDraft = {
  id: string;
  name: string;
  costType: CostItemType;
  scope: CostItemScope;
  costDriver: CostDriver;
};

type SetupMode = "manual" | "crm";

const issuedCompany = {
  companyCode: "MP-0001",
  businessName: "Member Pilates",
  industryTypeLabel: "スタジオ",
  closingMonth: 3,
};

const initialMembershipPlans: MembershipPlanDraft[] = [
  { id: "regular", name: "通常会員", monthlyFee: 9800, usageLabel: "月4回" },
  { id: "premium", name: "上級会員", monthlyFee: 16800, usageLabel: "通い放題" },
  { id: "short", name: "短期集中", monthlyFee: 24000, usageLabel: "3か月集中" },
];

const initialCostTemplates: CostTemplateDraft[] = [
  {
    code: "rent",
    name: "家賃",
    costType: "fixed",
    scope: "location",
    costDriver: "fixed",
    defaultAmount: null,
    enabled: true,
  },
  {
    code: "staff",
    name: "人件費",
    costType: "fixed",
    scope: "company",
    costDriver: "fixed",
    defaultAmount: null,
    enabled: true,
  },
  {
    code: "utilities",
    name: "水道光熱費",
    costType: "fixed",
    scope: "location",
    costDriver: "fixed",
    defaultAmount: null,
    enabled: true,
  },
  {
    code: "payment_fee",
    name: "決済手数料",
    costType: "variable",
    scope: "company",
    costDriver: "revenue",
    defaultAmount: null,
    enabled: true,
  },
  {
    code: "system",
    name: "システム利用料",
    costType: "fixed",
    scope: "head_office",
    costDriver: "fixed",
    defaultAmount: null,
    enabled: true,
  },
  {
    code: "ads",
    name: "広告費",
    costType: "variable",
    scope: "company",
    costDriver: "lead_count",
    defaultAmount: null,
    enabled: true,
  },
];

const initialCustomCostItems: CustomCostItemDraft[] = [
  {
    id: "training-tools",
    name: "研修教材費",
    costType: "fixed",
    scope: "company",
    costDriver: "fixed",
  },
];

const costDriverOptions: { label: string; value: CostDriver }[] = [
  { label: "手入力/固定額", value: "fixed" },
  { label: "売上", value: "revenue" },
  { label: "会員数", value: "member_count" },
  { label: "新規入会数", value: "new_members" },
  { label: "問い合わせ数", value: "lead_count" },
  { label: "体験数", value: "trial_count" },
  { label: "拠点数", value: "location_count" },
  { label: "スタッフ数", value: "staff_count" },
];

const numberFormatter = new Intl.NumberFormat("ja-JP");

export function meta() {
  return [{ title: "初期セットアップ" }, { name: "description", content: "初期セットアップ" }];
}

const toNumber = (value: string | number): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const scopeLabel = (scope: CostItemScope) => {
  switch (scope) {
    case "company":
      return "全社";
    case "head_office":
      return "本部";
    case "location":
      return "拠点";
  }
};

const costDriverLabel = (driver: CostDriver) => {
  return costDriverOptions.find((option) => option.value === driver)?.label ?? "固定額";
};

// 初期セットアップは、会社発行済み情報を前提に会員プランと販管費項目だけを整える。
export default function SetupIndexRoute() {
  const [membershipPlans, setMembershipPlans] = useState(initialMembershipPlans);
  const [costTemplates, setCostTemplates] = useState(initialCostTemplates);
  const [customCostItems, setCustomCostItems] = useState(initialCustomCostItems);
  const [setupMode, setSetupMode] = useState<SetupMode>("manual");

  const enabledTemplateCostCount = costTemplates.filter((template) => template.enabled).length;
  const enabledCostCount = enabledTemplateCostCount + customCostItems.length;
  const completedItemCount = useMemo(() => {
    const hasPlan = membershipPlans.some((plan) => plan.name.trim().length > 0);
    const hasCost =
      costTemplates.some((template) => template.enabled) || customCostItems.length > 0;
    return [hasPlan, hasCost, setupMode].filter(Boolean).length;
  }, [costTemplates, customCostItems, membershipPlans, setupMode]);

  const updateMembershipPlan = (
    planId: string,
    field: keyof MembershipPlanDraft,
    value: string | number,
  ) => {
    // 会員プランは mock 状態で更新し、後続の収支計画の選択肢になる想定。
    setMembershipPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              [field]: field === "monthlyFee" ? toNumber(value) : String(value),
            }
          : plan,
      ),
    );
  };

  const addMembershipPlan = () => {
    // 業種テンプレートにない会員種別を、その場で追加できるようにする。
    setMembershipPlans((current) => [
      ...current,
      {
        id: `plan-${Date.now()}`,
        name: "新しい会員プラン",
        monthlyFee: 0,
        usageLabel: "月4回",
      },
    ]);
  };

  const removeMembershipPlan = (planId: string) => {
    // 最低1件は残して、収支計画で使う会員プランが空になる状態を避ける。
    setMembershipPlans((current) => {
      if (current.length <= 1) return current;
      return current.filter((plan) => plan.id !== planId);
    });
  };

  const toggleCostTemplate = (code: string, enabled: boolean) => {
    // admin 管理の共通テンプレートから、自社で使う費用項目だけを選ぶ。
    setCostTemplates((current) =>
      current.map((template) => (template.code === code ? { ...template, enabled } : template)),
    );
  };

  const addCustomCostItem = () => {
    // テンプレートにない自社独自の販管費項目を、その場で追加できるようにする。
    setCustomCostItems((current) => [
      ...current,
      {
        id: `custom-cost-${Date.now()}`,
        name: "独自費用項目",
        costType: "fixed",
        scope: "company",
        costDriver: "fixed",
      },
    ]);
  };

  const updateCustomCostItem = (
    itemId: string,
    field: keyof CustomCostItemDraft,
    value: string,
  ) => {
    // mock UI 上では、名称・費用区分・集計単位・連動項目だけを編集対象にする。
    setCustomCostItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;
        if (field === "costType") {
          const nextCostType = value as CostItemType;
          return {
            ...item,
            costType: nextCostType,
            costDriver: nextCostType === "fixed" ? "fixed" : "member_count",
          };
        }
        return { ...item, [field]: value };
      }),
    );
  };

  const removeCustomCostItem = (itemId: string) => {
    setCustomCostItems((current) => current.filter((item) => item.id !== itemId));
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
              初期セットアップ
            </Text>
          </Group>
          <Title order={2}>初期セットアップ</Title>
          <Text c="dimmed" size="sm">
            会社発行済みの情報を確認し、収支計画で使う会員プランと販管費項目を整えます。
          </Text>
        </Stack>
        <Badge color="teal" radius="sm" variant="light">
          {completedItemCount} / 3 完了
        </Badge>
      </Group>

      <Paper className="app-dashboard-surface" p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="teal" radius="sm" variant="light">
              <Building2 size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={700}>自社情報</Text>
              <Text c="dimmed" size="sm">
                会社IDは admin 発行時に決まり、ここでは変更しません。
              </Text>
            </Stack>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <Stack gap={2}>
              <Text c="dimmed" fw={600} size="xs">
                会社ID
              </Text>
              <Text fw={700}>{issuedCompany.companyCode}</Text>
            </Stack>
            <Stack gap={2}>
              <Text c="dimmed" fw={600} size="xs">
                事業者名
              </Text>
              <Text fw={700}>{issuedCompany.businessName}</Text>
            </Stack>
            <Stack gap={2}>
              <Text c="dimmed" fw={600} size="xs">
                業種
              </Text>
              <Text fw={700}>{issuedCompany.industryTypeLabel}</Text>
            </Stack>
            <Stack gap={2}>
              <Text c="dimmed" fw={600} size="xs">
                決算月
              </Text>
              <Text fw={700}>{issuedCompany.closingMonth}月</Text>
            </Stack>
          </SimpleGrid>
          <Text c="dimmed" size="sm">
            社名変更、移転、決算月変更は自社情報で編集します。
          </Text>
        </Stack>
      </Paper>

      <Paper className="app-dashboard-surface" p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Group gap="sm">
              <ThemeIcon color="blue" radius="sm" variant="light">
                <CreditCard size={18} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text fw={700}>会員プラン</Text>
                <Text c="dimmed" size="sm">
                  収支計画で使う会員プランです。プラン内容には月4回、通い放題、受験生などの識別情報を入れます。
                </Text>
              </Stack>
            </Group>
            <Button leftSection={<Plus size={16} />} onClick={addMembershipPlan} variant="light">
              プラン追加
            </Button>
          </Group>

          <Table.ScrollContainer minWidth={760}>
            <Table withColumnBorders withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>名称</Table.Th>
                  <Table.Th>プラン内容</Table.Th>
                  <Table.Th ta="right">基準月額</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {membershipPlans.map((plan) => (
                  <Table.Tr key={plan.id}>
                    <Table.Td miw={180}>
                      <TextInput
                        onChange={(event) =>
                          updateMembershipPlan(plan.id, "name", event.currentTarget.value)
                        }
                        value={plan.name}
                      />
                    </Table.Td>
                    <Table.Td miw={160}>
                      <TextInput
                        onChange={(event) =>
                          updateMembershipPlan(plan.id, "usageLabel", event.currentTarget.value)
                        }
                        placeholder="月4回 / 通い放題 / 受験生"
                        value={plan.usageLabel}
                      />
                    </Table.Td>
                    <Table.Td miw={160}>
                      <NumberInput
                        allowDecimal={false}
                        min={0}
                        onChange={(value) => updateMembershipPlan(plan.id, "monthlyFee", value)}
                        prefix="¥"
                        thousandSeparator=","
                        value={plan.monthlyFee}
                      />
                    </Table.Td>
                    <Table.Td ta="center">
                      <ActionIcon
                        aria-label="会員プランを削除"
                        color="red"
                        disabled={membershipPlans.length <= 1}
                        onClick={() => removeMembershipPlan(plan.id)}
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

      <Paper className="app-dashboard-surface" p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="teal" radius="sm" variant="light">
              <BadgeJapaneseYen size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={700}>利用する販管費項目</Text>
              <Text c="dimmed" size="sm">
                admin が管理する業種別テンプレートから、自社で使う項目だけ選びます。
              </Text>
            </Stack>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing="md">
            {costTemplates.map((template) => (
              <Stack
                gap="xs"
                key={template.code}
                p="md"
                style={{
                  border: "1px solid var(--app-border)",
                  borderRadius: "var(--mantine-radius-sm)",
                }}
              >
                <Checkbox
                  checked={template.enabled}
                  description={
                    <Group gap="xs" mt={4}>
                      <Badge
                        color={template.costType === "fixed" ? "blue" : "teal"}
                        radius="sm"
                        variant="light"
                      >
                        {template.costType === "fixed" ? "固定費" : "変動費"}
                      </Badge>
                      <Badge color="gray" radius="sm" variant="light">
                        {scopeLabel(template.scope)}
                      </Badge>
                      {template.costType === "variable" ? (
                        <Badge color="orange" radius="sm" variant="light">
                          {costDriverLabel(template.costDriver)}連動
                        </Badge>
                      ) : null}
                    </Group>
                  }
                  label={<Text fw={700}>{template.name}</Text>}
                  onChange={(event) =>
                    toggleCostTemplate(template.code, event.currentTarget.checked)
                  }
                />
              </Stack>
            ))}
          </SimpleGrid>

          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text fw={700}>独自の販管費項目</Text>
                <Text c="dimmed" size="sm">
                  テンプレートにない費用は、自社項目として追加します。
                </Text>
              </Stack>
              <Button leftSection={<Plus size={16} />} onClick={addCustomCostItem} variant="light">
                費用追加
              </Button>
            </Group>

            <Table.ScrollContainer minWidth={760}>
              <Table withColumnBorders withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>名称</Table.Th>
                    <Table.Th>費用区分</Table.Th>
                    <Table.Th>集計単位</Table.Th>
                    <Table.Th>連動項目</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {customCostItems.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td miw={220}>
                        <TextInput
                          onChange={(event) =>
                            updateCustomCostItem(item.id, "name", event.currentTarget.value)
                          }
                          value={item.name}
                        />
                      </Table.Td>
                      <Table.Td miw={160}>
                        <Select
                          allowDeselect={false}
                          data={[
                            { label: "固定費", value: "fixed" },
                            { label: "変動費", value: "variable" },
                          ]}
                          onChange={(value) =>
                            updateCustomCostItem(item.id, "costType", value ?? "fixed")
                          }
                          value={item.costType}
                        />
                      </Table.Td>
                      <Table.Td miw={160}>
                        <Select
                          allowDeselect={false}
                          data={[
                            { label: "全社", value: "company" },
                            { label: "本部", value: "head_office" },
                            { label: "拠点", value: "location" },
                          ]}
                          onChange={(value) =>
                            updateCustomCostItem(item.id, "scope", value ?? "company")
                          }
                          value={item.scope}
                        />
                      </Table.Td>
                      <Table.Td miw={180}>
                        <Select
                          allowDeselect={false}
                          data={costDriverOptions}
                          disabled={item.costType === "fixed"}
                          onChange={(value) =>
                            updateCustomCostItem(item.id, "costDriver", value ?? "fixed")
                          }
                          value={item.costType === "fixed" ? "fixed" : item.costDriver}
                        />
                      </Table.Td>
                      <Table.Td ta="center">
                        <ActionIcon
                          aria-label="独自販管費項目を削除"
                          color="red"
                          onClick={() => removeCustomCostItem(item.id)}
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
        </Stack>
      </Paper>

      <Paper className="app-dashboard-surface" p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="violet" radius="sm" variant="light">
              <NotebookTabs size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={700}>開始方法</Text>
              <Text c="dimmed" size="sm">
                CRM 実績が整うまでは手入力でも収支計画を作れます。
              </Text>
            </Stack>
          </Group>
          <SegmentedControl
            data={[
              { label: "まず手入力で始める", value: "manual" },
              { label: "CRM 実績を使う", value: "crm" },
            ]}
            onChange={(value) => setSetupMode(value as SetupMode)}
            value={setupMode}
          />
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Stack gap={2}>
              <Text c="dimmed" fw={600} size="xs">
                会員プラン
              </Text>
              <Text fw={700}>{numberFormatter.format(membershipPlans.length)}件</Text>
            </Stack>
            <Stack gap={2}>
              <Text c="dimmed" fw={600} size="xs">
                販管費項目
              </Text>
              <Text fw={700}>{numberFormatter.format(enabledCostCount)}件</Text>
            </Stack>
            <Stack gap={2}>
              <Text c="dimmed" fw={600} size="xs">
                開始方法
              </Text>
              <Text fw={700}>{setupMode === "manual" ? "手入力" : "CRM 実績"}</Text>
            </Stack>
          </SimpleGrid>
        </Stack>
      </Paper>

      <Group justify="space-between">
        <Button component={Link} to="/settings/system" variant="light">
          システム設定へ
        </Button>
        <Button component={Link} leftSection={<Check size={16} />} to="/initial-plan">
          収支計画へ進む
        </Button>
      </Group>
    </Stack>
  );
}
