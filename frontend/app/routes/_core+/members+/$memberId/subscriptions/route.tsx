import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { ArrowLeft, CircleSlash, CreditCard, Pause, PencilLine, Play, Repeat } from "lucide-react";
import { useState } from "react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useRevalidator,
} from "react-router";

import { getSdk, type MembershipSubscriptionItemFragment } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { formatDateYmd } from "~/lib/date";
import type { MemberDetailContext } from "~/routes/_core+/members+/$memberId/route";
import { SubscriptionEditModal } from "~/routes/_core+/members+/$memberId/subscriptions/components/subscription-edit-modal";
import { SubscriptionEndModal } from "~/routes/_core+/members+/$memberId/subscriptions/components/subscription-end-modal";
import { SubscriptionPlanChangeModal } from "~/routes/_core+/members+/$memberId/subscriptions/components/subscription-plan-change-modal";
import {
  formatSubscriptionStatus,
  subscriptionStatusBadgeColor,
} from "~/routes/_core+/members+/subscription-status";
import { getGraphQLClient } from "~/services/graphql-client";

// コース管理タブに必要な契約履歴・プラン変更用の募集中プランに加え、
// 契約ごとの計上回数・売上を集計するための売上明細も取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const memberId = params.memberId;
  if (!memberId) {
    throw new Response("memberId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const [
    { membershipSubscriptionsByMemberId },
    { activeMembershipPlans },
    { revenueRecordsByMemberId },
  ] = await Promise.all([
    sdk.membershipSubscriptionsByMemberId({ memberId }),
    sdk.activeMembershipPlans(),
    sdk.revenueRecordsByMemberId({ memberId }),
  ]);

  return {
    subscriptions: (membershipSubscriptionsByMemberId ?? []).filter(
      (subscription) => subscription != null,
    ),
    plans: (activeMembershipPlans ?? []).filter((plan) => plan != null),
    revenues: (revenueRecordsByMemberId ?? []).filter((record) => record != null),
  };
};

type PlanChangeForm = {
  intent: "changePlan";
  membershipPlanId: string;
  startDate: string;
  monthlyFee?: number;
  note?: string;
};

type StatusChangeForm = {
  intent: "pause" | "resume";
  membershipSubscriptionId: string;
};

type EndForm = {
  intent: "end";
  membershipSubscriptionId: string;
  endDate: string;
};

type UpdateForm = {
  intent: "updateSubscription";
  membershipSubscriptionId: string;
  monthlyFee: number;
  note?: string;
};

type SubscriptionActionForm = PlanChangeForm | StatusChangeForm | EndForm | UpdateForm;

// コース管理タブから、プラン変更・休会・再開・契約終了・修正を受け付ける。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const memberId = params.memberId;
  if (!memberId) {
    throw new Response("memberId is required", { status: 400 });
  }

  const form = (await request.json()) as SubscriptionActionForm;
  const client = getGraphQLClient();
  const sdk = getSdk(client);

  if (form.intent === "changePlan") {
    const { changeMembershipPlan } = await sdk.changeMembershipPlan({
      memberId,
      input: {
        membershipPlanId: form.membershipPlanId,
        startDate: form.startDate,
        monthlyFee: form.monthlyFee,
        note: form.note || undefined,
      },
    });
    return {
      message: changeMembershipPlan ? "ok" : "ng",
      subscription: changeMembershipPlan ?? undefined,
      notify: changeMembershipPlan
        ? { type: "success" as const, message: "契約を登録しました" }
        : { type: "error" as const, message: "契約の登録に失敗しました" },
    };
  }

  if (form.intent === "pause" || form.intent === "resume") {
    const result =
      form.intent === "pause"
        ? (
            await sdk.pauseMembershipSubscription({
              membershipSubscriptionId: form.membershipSubscriptionId,
            })
          ).pauseMembershipSubscription
        : (
            await sdk.resumeMembershipSubscription({
              membershipSubscriptionId: form.membershipSubscriptionId,
            })
          ).resumeMembershipSubscription;
    const label = form.intent === "pause" ? "休会" : "再開";
    return {
      message: result ? "ok" : "ng",
      subscription: result ?? undefined,
      notify: result
        ? { type: "success" as const, message: `契約を${label}しました` }
        : { type: "error" as const, message: `${label}に失敗しました` },
    };
  }

  if (form.intent === "end") {
    const { endMembershipSubscription } = await sdk.endMembershipSubscription({
      membershipSubscriptionId: form.membershipSubscriptionId,
      endDate: form.endDate,
    });
    return {
      message: endMembershipSubscription ? "ok" : "ng",
      subscription: endMembershipSubscription ?? undefined,
      notify: endMembershipSubscription
        ? { type: "success" as const, message: "契約を終了しました" }
        : { type: "error" as const, message: "契約の終了に失敗しました" },
    };
  }

  if (form.intent === "updateSubscription") {
    const { updateMembershipSubscription } = await sdk.updateMembershipSubscription({
      membershipSubscriptionId: form.membershipSubscriptionId,
      input: {
        monthlyFee: form.monthlyFee,
        note: form.note || undefined,
      },
    });
    return {
      message: updateMembershipSubscription ? "ok" : "ng",
      subscription: updateMembershipSubscription ?? undefined,
      notify: updateMembershipSubscription
        ? { type: "success" as const, message: "契約を修正しました" }
        : { type: "error" as const, message: "契約の修正に失敗しました" },
    };
  }

  throw new Response("unknown intent", { status: 400 });
};

export type SubscriptionActionData = Awaited<ReturnType<typeof clientAction>>;

// 契約ごとの売上計上の集計値。単価×回数の確認に使う台帳の数値。
type SubscriptionLedgerStats = {
  // この契約に紐づく売上明細の件数（自動計上された月謝の月数に相当）。
  count: number;
  // この契約に紐づく売上金額の合計。
  total: number;
};

// 会員詳細のコース管理タブ。契約を台帳形式で並べ、単価・計上回数・累計売上をまとめる。
export default function MemberSubscriptionsRoute() {
  const { member } = useOutletContext<MemberDetailContext>();
  const { subscriptions, plans, revenues } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isPlanChangeOpen, setPlanChangeOpen] = useState(false);
  const [isEndOpen, setEndOpen] = useState(false);
  // 修正対象の契約。台帳のどの行からも月額・メモを直せるようにする。
  const [editSubscription, setEditSubscription] =
    useState<MembershipSubscriptionItemFragment | null>(null);

  // アクティブ契約（終了済み以外）。部分 unique index により最大1件。
  const current = subscriptions.find((subscription) => subscription.status !== "ended");

  // 契約IDごとに計上回数と売上を集計する。売上明細は契約に紐づくものだけ取り込む。
  const statsBySubscriptionId = new Map<string, SubscriptionLedgerStats>();
  for (const record of revenues) {
    const subscriptionId = record.membershipSubscriptionId;
    if (!subscriptionId) continue;
    const stats = statsBySubscriptionId.get(subscriptionId) ?? { count: 0, total: 0 };
    stats.count += 1;
    stats.total += record.amount ?? 0;
    statsBySubscriptionId.set(subscriptionId, stats);
  }

  // 台帳は新しい契約が上に来るよう開始日降順（同日は作成日時降順）で並べる。
  const ledgerRows = [...subscriptions].sort((a, b) => {
    const startDiff = (b.startDate ?? "").localeCompare(a.startDate ?? "");
    if (startDiff !== 0) return startDiff;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  // 台帳全体のサマリ。契約横断の計上回数・売上を会員単位で把握できるようにする。
  const totalCount = ledgerRows.reduce(
    (sum, subscription) => sum + (statsBySubscriptionId.get(subscription.id ?? "")?.count ?? 0),
    0,
  );
  const totalRevenue = ledgerRows.reduce(
    (sum, subscription) => sum + (statsBySubscriptionId.get(subscription.id ?? "")?.total ?? 0),
    0,
  );

  const mutation = useActionFetcher<SubscriptionActionData>({
    defaultAction: ({ memberId }: { memberId: string }) => `/members/${memberId}/subscriptions`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      setPlanChangeOpen(false);
      setEndOpen(false);
      setEditSubscription(null);
      revalidator.revalidate();
    },
  });

  // 休会・再開はワンクリック操作。失敗時は通知で気付ける。
  const submitStatusChange = (intent: "pause" | "resume") => {
    if (!member.id || !current?.id) return;
    mutation.submit({ intent, membershipSubscriptionId: current.id }, [{ memberId: member.id }]);
  };

  return (
    <Stack gap="md">
      <Group>
        <Button
          leftSection={<ArrowLeft size={16} />}
          variant="default"
          onClick={() => navigate("/members")}
        >
          一覧へ戻る
        </Button>
      </Group>

      {/* コース契約台帳。ヘッダーの操作は現在の契約（active/paused）に対して行う。 */}
      <Paper p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="sm">
              <ThemeIcon color="brand" radius="sm" variant="light">
                <CreditCard size={18} />
              </ThemeIcon>
              <Stack gap={0}>
                <Title order={3} size="h4">
                  コース契約台帳
                </Title>
                <Text c="dimmed" size="sm">
                  契約ごとの単価・計上回数・売上
                </Text>
              </Stack>
            </Group>
            {current ? (
              <Group gap="xs">
                <Button
                  leftSection={<Repeat size={16} />}
                  variant="default"
                  onClick={() => setPlanChangeOpen(true)}
                >
                  プラン変更
                </Button>
                {current.status === "active" ? (
                  <Button
                    leftSection={<Pause size={16} />}
                    loading={mutation.submitting}
                    variant="default"
                    onClick={() => submitStatusChange("pause")}
                  >
                    休会
                  </Button>
                ) : (
                  <Button
                    leftSection={<Play size={16} />}
                    loading={mutation.submitting}
                    variant="default"
                    onClick={() => submitStatusChange("resume")}
                  >
                    再開
                  </Button>
                )}
                <Button
                  color="red"
                  leftSection={<CircleSlash size={16} />}
                  variant="outline"
                  onClick={() => setEndOpen(true)}
                >
                  契約終了
                </Button>
              </Group>
            ) : null}
          </Group>

          {/* 台帳サマリ。会員単位の契約数・計上回数・累計売上を売上タブと同じ文法で見せる。 */}
          <Group gap="xl">
            <SummaryItem label="契約数" value={`${ledgerRows.length}件`} />
            <SummaryItem label="計上回数" value={`${totalCount}回`} />
            <SummaryItem label="累計売上" value={formatAmount(totalRevenue)} />
          </Group>

          {ledgerRows.length === 0 ? (
            <Alert color="yellow" title="契約がありません">
              <Stack align="flex-start" gap="sm">
                <Text size="sm">新しい契約を開始すると、ここに契約が台帳として表示されます。</Text>
                <Button
                  leftSection={<CreditCard size={16} />}
                  onClick={() => setPlanChangeOpen(true)}
                >
                  新しい契約を開始
                </Button>
              </Stack>
            </Alert>
          ) : (
            <Box className="overflow-x-auto">
              <Table highlightOnHover miw={760} verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      <HeaderText>プラン</HeaderText>
                    </Table.Th>
                    <Table.Th ta="right" w={120}>
                      <HeaderText>単価(月額)</HeaderText>
                    </Table.Th>
                    <Table.Th w={180}>
                      <HeaderText>期間</HeaderText>
                    </Table.Th>
                    <Table.Th w={90}>
                      <HeaderText>状態</HeaderText>
                    </Table.Th>
                    <Table.Th ta="right" w={80}>
                      <HeaderText>回数</HeaderText>
                    </Table.Th>
                    <Table.Th ta="right" w={120}>
                      <HeaderText>累計売上</HeaderText>
                    </Table.Th>
                    <Table.Th>
                      <HeaderText>メモ</HeaderText>
                    </Table.Th>
                    <Table.Th ta="center" w={70}>
                      操作
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ledgerRows.map((subscription) => {
                    const stats = statsBySubscriptionId.get(subscription.id ?? "");
                    return (
                      <Table.Tr key={subscription.id}>
                        <Table.Td>
                          <Text fw={600} size="sm">
                            {subscription.membershipPlan?.name ?? "プラン未設定"}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Text size="sm">{formatAmount(subscription.monthlyFee)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatSubscriptionPeriod(subscription)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={subscriptionStatusBadgeColor(subscription.status)}
                            radius="sm"
                            variant="light"
                          >
                            {formatSubscriptionStatus(subscription.status)}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Text size="sm">{stats ? `${stats.count}回` : "-"}</Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Text fw={600} size="sm">
                            {stats ? formatAmount(stats.total) : "-"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text c="dimmed" lineClamp={1} size="sm">
                            {subscription.note ?? "-"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="center" wrap="nowrap">
                            <Tooltip label="月額・メモを修正">
                              <ActionIcon
                                aria-label="契約を修正"
                                variant="subtle"
                                onClick={() => setEditSubscription(subscription)}
                              >
                                <PencilLine size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Box>
          )}

          <Text c="dimmed" size="xs">
            回数・累計売上は売上台帳から集計しています。月謝の計上は売上画面の「月謝を生成」、明細の確認・編集は売上タブで行えます。
          </Text>
        </Stack>
      </Paper>

      <SubscriptionPlanChangeModal
        current={current ?? null}
        member={member}
        mutation={mutation}
        opened={isPlanChangeOpen}
        plans={plans}
        onClose={() => setPlanChangeOpen(false)}
      />
      <SubscriptionEndModal
        memberId={member.id ? String(member.id) : null}
        mutation={mutation}
        opened={isEndOpen}
        subscription={current ?? null}
        onClose={() => setEndOpen(false)}
      />
      <SubscriptionEditModal
        memberId={member.id ? String(member.id) : null}
        mutation={mutation}
        subscription={editSubscription}
        onClose={() => setEditSubscription(null)}
      />
    </Stack>
  );
}

// 台帳サマリの1項目。項目名と値を縦に並べる小さな表示部品（売上タブと同じ文法）。
function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={2}>
      <Text c="dimmed" fw={600} size="sm">
        {label}
      </Text>
      <Text fw={700} size="lg">
        {value}
      </Text>
    </Stack>
  );
}

// テーブル見出し。読み飛ばされないよう太字で統一する。
function HeaderText({ children }: { children: React.ReactNode }) {
  return (
    <Text fw={700} size="sm">
      {children}
    </Text>
  );
}

// 金額を「¥12,000」の形式へ整形する。
function formatAmount(value: number | undefined | null) {
  if (value == null) return "-";
  return `¥${value.toLocaleString()}`;
}

// 契約期間を「開始日 〜 終了日」の形式へ整形する。継続中は終了日を空けておく。
function formatSubscriptionPeriod(subscription: MembershipSubscriptionItemFragment) {
  const start = formatDateYmd(subscription.startDate);
  return subscription.endDate
    ? `${start} 〜 ${formatDateYmd(subscription.endDate)}`
    : `${start} 〜`;
}
