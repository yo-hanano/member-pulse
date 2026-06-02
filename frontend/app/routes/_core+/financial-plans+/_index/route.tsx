import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  Paper,
  ScrollArea,
  Splitter,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
  RotateCw,
  Settings,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

type PlanGroup = {
  id: string;
  parentId: string | null;
  name: string;
  fiscalYear: string;
  scopeLabel: string;
  description: string;
};

type PlanCard = {
  id: string;
  groupId: string;
  name: string;
  period: string;
  status: "actual" | "draft" | "ready" | "simulated";
  revenueGoal: string;
  profitGoal: string;
  memberGoal: string;
  lastUpdated: string;
  mediaPlans: number;
  memo: string;
  adSpend: string;
  cpo: string;
  newMembers: string;
  basisLabel: string;
};

const planGroups: PlanGroup[] = [
  {
    id: "root-actual",
    parentId: null,
    name: "過去実績",
    fiscalYear: "年度横断",
    scopeLabel: "実績",
    description: "CRM実績または手動入力から作成した基準実績を管理します",
  },
  {
    id: "root-plan",
    parentId: null,
    name: "収支計画",
    fiscalYear: "年度横断",
    scopeLabel: "計画",
    description: "年度別の収支計画と比較案を管理します",
  },
  {
    id: "scenario",
    parentId: "root-plan",
    name: "検討シナリオ",
    fiscalYear: "年度横断",
    scopeLabel: "テーマ",
    description: "拠点追加や単価改善など、意思決定前の案をまとめます",
  },
  {
    id: "fy2026",
    parentId: "root-plan",
    name: "2026年度",
    fiscalYear: "2026年度",
    scopeLabel: "全社",
    description: "今年度の標準計画と比較案を管理します",
  },
  {
    id: "fy2025",
    parentId: "root-actual",
    name: "2025年度",
    fiscalYear: "2025年度",
    scopeLabel: "全社",
    description: "前年の過去実績を管理します",
  },
  {
    id: "location-expansion",
    parentId: "scenario",
    name: "拠点追加検討",
    fiscalYear: "2026年度",
    scopeLabel: "全社 / 拠点",
    description: "2拠点目や新規出店シナリオをまとめます",
  },
];

const planCards: PlanCard[] = [
  {
    id: "actual-2025",
    groupId: "fy2025",
    name: "2025年度 過去実績",
    period: "2025年4月 - 2026年3月",
    status: "actual",
    revenueGoal: "¥11.8M",
    profitGoal: "¥1.6M",
    memberGoal: "86人",
    lastUpdated: "2026/05/31",
    mediaPlans: 0,
    memo: "月次レビュー実績から作成。成り行き計画の初期値として使えます",
    adSpend: "¥1.2M",
    cpo: "¥42k",
    newMembers: "29人",
    basisLabel: "基準実績",
  },
  {
    id: "fy2026-base",
    groupId: "fy2026",
    name: "2026年度 ベース計画",
    period: "2026年4月 - 2027年3月",
    status: "simulated",
    revenueGoal: "¥14.4M",
    profitGoal: "¥2.4M",
    memberGoal: "110人",
    lastUpdated: "2026/06/01",
    mediaPlans: 2,
    memo: "通常会員と上級会員の獲得を中心にした標準案",
    adSpend: "¥1.8M",
    cpo: "¥31k",
    newMembers: "58人",
    basisLabel: "採用中",
  },
  {
    id: "fy2026-growth",
    groupId: "fy2026",
    name: "上級会員強化案",
    period: "2026年4月 - 2027年3月",
    status: "ready",
    revenueGoal: "¥16.8M",
    profitGoal: "¥3.1M",
    memberGoal: "118人",
    lastUpdated: "2026/05/28",
    mediaPlans: 1,
    memo: "単価改善を優先し、広告費は抑えめに置く案",
    adSpend: "¥1.5M",
    cpo: "¥29k",
    newMembers: "52人",
    basisLabel: "比較案",
  },
  {
    id: "fy2026-location",
    groupId: "location-expansion",
    name: "2拠点目検討案",
    period: "2026年7月 - 2027年6月",
    status: "draft",
    revenueGoal: "¥20.0M",
    profitGoal: "¥2.0M",
    memberGoal: "150人",
    lastUpdated: "2026/05/20",
    mediaPlans: 0,
    memo: "拠点追加前提。固定費と広告費の確認が未完了",
    adSpend: "¥2.4M",
    cpo: "未計算",
    newMembers: "未設定",
    basisLabel: "検討中",
  },
];

export function meta() {
  return [{ title: "収支計画 | MemberPulse" }, { name: "description", content: "収支計画" }];
}

const statusBadge = (status: PlanCard["status"]) => {
  switch (status) {
    case "actual":
      return { color: "grape", label: "過去実績" };
    case "draft":
      return { color: "gray", label: "下書き" };
    case "ready":
      return { color: "blue", label: "計算待ち" };
    case "simulated":
      return { color: "teal", label: "計算済み" };
  }
};

function PlanGroupTreeNode({
  active,
  depth,
  expanded,
  group,
  hasChildren,
  planCount,
  onSelect,
  onToggle,
}: {
  active: boolean;
  depth: number;
  expanded: boolean;
  group: PlanGroup;
  hasChildren: boolean;
  planCount: number;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const FolderIcon = hasChildren && expanded ? FolderOpen : Folder;

  return (
    <Button
      color={active ? "teal" : "gray"}
      fullWidth
      h="auto"
      justify="space-between"
      onClick={onSelect}
      p={0}
      radius="sm"
      variant={active ? "light" : "subtle"}
    >
      <Group gap={6} px="xs" py={7} style={{ paddingLeft: 8 + depth * 18 }} w="100%" wrap="nowrap">
        {hasChildren ? (
          <ActionIcon
            aria-label={expanded ? `${group.name}を閉じる` : `${group.name}を開く`}
            color={active ? "teal" : "gray"}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            radius="sm"
            size="sm"
            variant="subtle"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </ActionIcon>
        ) : (
          <Box w={22} />
        )}
        <ThemeIcon color={active ? "teal" : "gray"} radius="sm" size="sm" variant="light">
          <FolderIcon size={14} />
        </ThemeIcon>
        <Stack align="flex-start" gap={1} style={{ minWidth: 0 }}>
          <Text fw={800} lineClamp={1} size="sm">
            {group.name}
          </Text>
          <Text c="dimmed" size="xs" lineClamp={1}>
            {group.scopeLabel} / {group.fiscalYear}
          </Text>
        </Stack>
        <Badge color={active ? "teal" : "gray"} ml="auto" radius="sm" variant="light">
          {planCount}
        </Badge>
      </Group>
    </Button>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" gap="md" wrap="nowrap">
      <Text c="dimmed" size="sm">
        {label}
      </Text>
      <Text fw={700} size="sm" ta="right">
        {value}
      </Text>
    </Group>
  );
}

function PlanCardItem({ plan }: { plan: PlanCard }) {
  const badge = statusBadge(plan.status);
  const isActual = plan.status === "actual";

  return (
    <Paper
      className="app-dashboard-surface"
      p={0}
      radius="sm"
      shadow="xs"
      style={{ minHeight: 560, height: "100%", overflow: "hidden" }}
      withBorder
    >
      <Box bg={isActual ? "grape.6" : plan.status === "simulated" ? "teal.6" : "gray.1"} h={30}>
        <Text
          c={isActual || plan.status === "simulated" ? "white" : "dimmed"}
          fw={800}
          pt={5}
          size="xs"
          ta="center"
        >
          {plan.basisLabel}
        </Text>
      </Box>
      <Stack gap="md" justify="space-between" p="md" style={{ minHeight: 530 }}>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" gap="xs" wrap="nowrap">
            <Stack gap={6} style={{ minWidth: 0, flex: 1 }}>
              <Text fw={800} size="lg" lineClamp={2}>
                {plan.name}
              </Text>
              <Group gap={6}>
                <Badge color={badge.color} radius="sm" variant="light">
                  {badge.label}
                </Badge>
                <Badge color="gray" radius="sm" variant="light">
                  {plan.period}
                </Badge>
              </Group>
            </Stack>
            <Menu position="bottom-end" shadow="md" width={190}>
              <Menu.Target>
                <Button aria-label={`${plan.name}の操作`} px="xs" variant="subtle">
                  <MoreHorizontal size={18} />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  component={Link}
                  leftSection={<Settings size={16} />}
                  to="/financial-plans/setting"
                >
                  設定内容を変更
                </Menu.Item>
                <Menu.Item leftSection={<Copy size={16} />}>コピー</Menu.Item>
                <Menu.Item leftSection={<RotateCw size={16} />}>再計算</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<Trash2 size={16} />}>
                  削除
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Stack gap={4}>
            <Text c="dimmed" fw={600} size="xs">
              売上
            </Text>
            <Text fw={900} size="xl">
              {plan.revenueGoal}
            </Text>
            <Text c="dimmed" fw={600} size="xs">
              営業利益
            </Text>
            <Text fw={900} size="xl">
              {plan.profitGoal}
            </Text>
          </Stack>

          <Divider />

          <Stack gap={8}>
            <SummaryLine label="年度末会員" value={plan.memberGoal} />
            <SummaryLine label="新規入会" value={plan.newMembers} />
            <SummaryLine label="広告費" value={plan.adSpend} />
            <SummaryLine label="CPO" value={plan.cpo} />
            <SummaryLine label="メディアプラン" value={`${plan.mediaPlans}件`} />
            <SummaryLine label="更新日" value={plan.lastUpdated} />
          </Stack>

          <Paper bg="var(--mantine-color-gray-light)" p="sm" radius="sm">
            <Text c="dimmed" size="sm" lineClamp={3}>
              {plan.memo}
            </Text>
          </Paper>
        </Stack>

        <Stack gap="xs">
          <Button
            component={Link}
            fullWidth
            rightSection={<ArrowRight size={16} />}
            to="/financial-plans/setting"
            variant={isActual ? "light" : "filled"}
          >
            {isActual ? "この実績から計画作成" : "設定を見る"}
          </Button>
          <Button fullWidth variant="default">
            {isActual ? "基準実績にする" : "この案を比較基準にする"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

// markeman の plan/list に寄せ、収支計画はまず一覧から作成・複製・設定へ入る。
export default function InitialPlanListRoute() {
  const [selectedGroupId, setSelectedGroupId] = useState("root-plan");
  const [expandedGroupIds, setExpandedGroupIds] = useState([
    "root-actual",
    "root-plan",
    "scenario",
  ]);
  const isCompactLayout = useMediaQuery("(max-width: 48em)");
  const selectedGroup = planGroups.find((group) => group.id === selectedGroupId) ?? planGroups[0];

  // 親フォルダ選択時に、配下の年度・テーマをまとめて表示できるよう階層を解決する。
  const childGroupsByParent = useMemo(
    () =>
      planGroups.reduce<Record<string, PlanGroup[]>>((accumulator, group) => {
        const parentKey = group.parentId ?? "root";
        accumulator[parentKey] = [...(accumulator[parentKey] ?? []), group];
        return accumulator;
      }, {}),
    [],
  );

  const collectGroupIds = (groupId: string): string[] => [
    groupId,
    ...(childGroupsByParent[groupId] ?? []).flatMap((childGroup) => collectGroupIds(childGroup.id)),
  ];

  const selectedGroupIds = collectGroupIds(selectedGroupId);
  const visiblePlans = planCards.filter((plan) => selectedGroupIds.includes(plan.groupId));
  const countPlansInGroup = (groupId: string) => {
    const groupIds = collectGroupIds(groupId);
    return planCards.filter((plan) => groupIds.includes(plan.groupId)).length;
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((current) =>
      current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId],
    );
  };

  const renderGroupTree = (parentId: string | null, depth = 0): ReactNode[] =>
    (childGroupsByParent[parentId ?? "root"] ?? []).flatMap((group) => {
      const hasChildren = (childGroupsByParent[group.id] ?? []).length > 0;
      const expanded = expandedGroupIds.includes(group.id);

      return [
        <PlanGroupTreeNode
          active={group.id === selectedGroupId}
          depth={depth}
          expanded={expanded}
          group={group}
          hasChildren={hasChildren}
          key={group.id}
          onSelect={() => setSelectedGroupId(group.id)}
          onToggle={() => toggleGroup(group.id)}
          planCount={countPlansInGroup(group.id)}
        />,
        ...(hasChildren && expanded ? renderGroupTree(group.id, depth + 1) : []),
      ];
    });

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
              収支計画
            </Text>
          </Group>
          <Title order={2}>収支計画</Title>
          <Text c="dimmed" size="sm">
            年度計画を作成し、会員数・売上・利益・広告費の着地を確認します。
          </Text>
        </Stack>
        <Group gap="sm">
          <Menu position="bottom-end" shadow="md" width={220}>
            <Menu.Target>
              <Button leftSection={<ClipboardCheck size={16} />} variant="filled">
                過去実績から作成
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<ClipboardCheck size={16} />}>CRM実績から作成</Menu.Item>
              <Menu.Item leftSection={<Plus size={16} />}>手動で作成</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Button leftSection={<Sparkles size={16} />} variant="light">
            ガイドで作成
          </Button>
          <Button
            component={Link}
            leftSection={<Plus size={16} />}
            to="/financial-plans/setting"
            variant="outline"
          >
            手動で作成
          </Button>
          <Button leftSection={<Target size={16} />} variant="default">
            計画戦略
          </Button>
        </Group>
      </Group>

      <Splitter
        handleColor="gray.3"
        lineSize={2}
        h={isCompactLayout ? "auto" : "calc(100dvh - 210px)"}
        mah={isCompactLayout ? undefined : "calc(100dvh - 210px)"}
        mih={isCompactLayout ? 760 : undefined}
        orientation={isCompactLayout ? "vertical" : "horizontal"}
        redistribute="nearest"
        style={{ overflow: "hidden" }}
        withHandle
      >
        <Splitter.Pane
          collapsible
          collapseThreshold={isCompactLayout ? 10 : 6}
          defaultSize={isCompactLayout ? 34 : 24}
          max={isCompactLayout ? 60 : 48}
          min={isCompactLayout ? 14 : 8}
        >
          <Paper
            className="app-dashboard-surface"
            p="md"
            radius="sm"
            style={{ height: "100%", minHeight: isCompactLayout ? 260 : undefined }}
            withBorder
          >
            <Stack gap="sm" h="100%">
              <Group gap="xs">
                <ThemeIcon color="teal" radius="sm" variant="light">
                  <CalendarDays size={18} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={800}>計画グループ</Text>
                  <Text c="dimmed" size="xs">
                    年度 / テーマ
                  </Text>
                </Stack>
              </Group>
              <Divider />
              <ScrollArea flex={1} h={isCompactLayout ? 160 : undefined} type="auto">
                <Stack gap={4} pr="xs">
                  {renderGroupTree(null)}
                </Stack>
              </ScrollArea>
              <Button leftSection={<Plus size={16} />} variant="light">
                グループ追加
              </Button>
            </Stack>
          </Paper>
        </Splitter.Pane>

        <Splitter.Pane defaultSize={isCompactLayout ? 66 : 76} min={isCompactLayout ? 40 : 40}>
          <ScrollArea h="100%" offsetScrollbars type="auto">
            <Stack
              gap="md"
              className="min-w-0"
              h="100%"
              pl={isCompactLayout ? 0 : "md"}
              pt={isCompactLayout ? "md" : 0}
            >
              <Paper className="app-dashboard-surface" p="lg" radius="sm" shadow="xs" withBorder>
                <Group justify="space-between" align="center">
                  <Group gap="sm" align="flex-start">
                    <ThemeIcon color="teal" radius="sm" variant="light">
                      <CalendarDays size={18} />
                    </ThemeIcon>
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Text fw={800}>{selectedGroup?.name}</Text>
                        <Badge color="gray" radius="sm" variant="light">
                          {selectedGroup?.scopeLabel}
                        </Badge>
                        <Badge color="gray" radius="sm" variant="light">
                          {selectedGroup?.fiscalYear}
                        </Badge>
                      </Group>
                      <Text c="dimmed" size="sm">
                        {selectedGroup?.description}
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
                      <Menu.Item leftSection={<ClipboardCheck size={16} />}>
                        CRM実績から作成
                      </Menu.Item>
                      <Menu.Item leftSection={<Plus size={16} />}>手動で作成</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Paper>

              <Paper className="app-dashboard-surface" p="md" radius="sm" withBorder>
                <Group gap="sm" align="flex-start">
                  <ThemeIcon color="grape" radius="sm" variant="light">
                    <ClipboardCheck size={18} />
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text fw={800}>過去実績を作ると、成り行き計画の初期値にできます</Text>
                    <Text c="dimmed" size="sm">
                      CRM
                      に会員・売上実績があれば自動作成し、まだ実績がない場合は手動入力で前年実績を作成できます。
                    </Text>
                  </Stack>
                </Group>
              </Paper>

              <ScrollArea flex={1} offsetScrollbars type="auto">
                <Box
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${Math.max(visiblePlans.length, 1)}, minmax(260px, 360px))`,
                    gap: 12,
                    minWidth: Math.max(visiblePlans.length, 1) * 292,
                    alignItems: "stretch",
                  }}
                >
                  {visiblePlans.map((plan) => (
                    <PlanCardItem key={plan.id} plan={plan} />
                  ))}
                  {visiblePlans.length === 0 ? (
                    <Paper className="app-dashboard-surface" p="lg" radius="sm" withBorder>
                      <Text c="dimmed" fw={700}>
                        このグループにはまだ計画がありません。
                      </Text>
                    </Paper>
                  ) : null}
                </Box>
              </ScrollArea>
            </Stack>
          </ScrollArea>
        </Splitter.Pane>
      </Splitter>
    </Stack>
  );
}
