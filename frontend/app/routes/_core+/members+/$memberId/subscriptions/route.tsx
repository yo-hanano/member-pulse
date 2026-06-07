import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  ArrowLeft,
  Check,
  CircleSlash,
  CreditCard,
  History,
  Pause,
  PencilLine,
  Play,
  Repeat,
} from "lucide-react";
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

// コース管理タブに必要な契約履歴と、プラン変更用の募集中プランを取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const memberId = params.memberId;
  if (!memberId) {
    throw new Response("memberId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const [{ membershipSubscriptionsByMemberId }, { activeMembershipPlans }] = await Promise.all([
    sdk.membershipSubscriptionsByMemberId({ memberId }),
    sdk.activeMembershipPlans(),
  ]);

  return {
    subscriptions: (membershipSubscriptionsByMemberId ?? []).filter(
      (subscription) => subscription != null,
    ),
    plans: (activeMembershipPlans ?? []).filter((plan) => plan != null),
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

// 会員詳細のコース管理タブ。現在の契約と契約履歴を表示し、契約操作をまとめる。
export default function MemberSubscriptionsRoute() {
  const { member } = useOutletContext<MemberDetailContext>();
  const { subscriptions, plans } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isPlanChangeOpen, setPlanChangeOpen] = useState(false);
  const [isEndOpen, setEndOpen] = useState(false);
  // 修正対象の契約。履歴のどの契約からも月額・メモを直せるようにする。
  const [editSubscription, setEditSubscription] =
    useState<MembershipSubscriptionItemFragment | null>(null);

  // アクティブ契約（終了済み以外）。部分 unique index により最大1件。
  const current = subscriptions.find((subscription) => subscription.status !== "ended");

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

      {/* 現在の契約カード。リード詳細・会員詳細と同じカード内ヘッダー文法に合わせる。 */}
      <Paper p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="sm">
              <ThemeIcon color="brand" radius="sm" variant="light">
                <CreditCard size={18} />
              </ThemeIcon>
              <Stack gap={0}>
                <Title order={3} size="h4">
                  現在の契約
                </Title>
                <Text c="dimmed" size="sm">
                  契約中のコースと月額
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

          {current ? (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Field label="プラン" value={current.membershipPlan?.name ?? "プラン未設定"} />
              <Field label="月額" value={formatMonthlyFee(current.monthlyFee)} />
              <Field label="開始日" value={formatDateYmd(current.startDate)} />
              <Stack gap={4}>
                <Text fw={600} size="sm">
                  状態
                </Text>
                <Badge
                  color={subscriptionStatusBadgeColor(current.status)}
                  radius="sm"
                  size="lg"
                  variant="light"
                >
                  {formatSubscriptionStatus(current.status)}
                </Badge>
              </Stack>
              <Field className="md:col-span-2" label="契約メモ" value={current.note ?? "-"} />
            </SimpleGrid>
          ) : (
            <Alert color="yellow" title="アクティブな契約がありません">
              <Stack align="flex-start" gap="sm">
                <Text size="sm">新しい契約を開始すると、ここに契約内容が表示されます。</Text>
                <Button
                  leftSection={<CreditCard size={16} />}
                  onClick={() => setPlanChangeOpen(true)}
                >
                  新しい契約を開始
                </Button>
              </Stack>
            </Alert>
          )}
        </Stack>
      </Paper>

      {/* 契約履歴タイムライン。リード詳細の対応履歴と同じ文法（日時降順・色とバッジの統一）。 */}
      <Paper p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="brand" radius="sm" variant="light">
              <History size={18} />
            </ThemeIcon>
            <Stack gap={0}>
              <Title order={3} size="h4">
                契約履歴
              </Title>
              <Text c="dimmed" size="sm">
                入会からのコース契約の記録
              </Text>
            </Stack>
          </Group>

          {subscriptions.length === 0 ? (
            <Text c="dimmed" size="sm">
              契約履歴はまだありません。
            </Text>
          ) : (
            <Timeline active={subscriptions.length - 1} bulletSize={28} lineWidth={2}>
              {subscriptions.map((subscription) => (
                <Timeline.Item
                  key={subscription.id}
                  bullet={subscriptionBullet(subscription.status)}
                  color={subscriptionStatusBadgeColor(subscription.status)}
                  title={
                    <Group align="flex-start" justify="space-between" gap="sm">
                      <Stack gap={2}>
                        {/* 契約期間と状態は判断の起点になるため、1行目に並べて主役として見せる。 */}
                        <Group gap="xs">
                          <Text fw={700} size="md">
                            {formatSubscriptionPeriod(subscription)}
                          </Text>
                          <Badge
                            color={subscriptionStatusBadgeColor(subscription.status)}
                            radius="sm"
                            size="lg"
                            variant="filled"
                          >
                            {formatSubscriptionStatus(subscription.status)}
                          </Badge>
                        </Group>
                        <Text c="dimmed" size="xs">
                          {subscription.membershipPlan?.name ?? "プラン未設定"}（
                          {formatMonthlyFee(subscription.monthlyFee)}/月）
                        </Text>
                      </Stack>
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
                  }
                >
                  {subscription.note ? (
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {subscription.note}
                    </Text>
                  ) : null}
                </Timeline.Item>
              ))}
            </Timeline>
          )}
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

function Field({ className, label, value }: { className?: string; label: string; value: string }) {
  return (
    <Stack className={className} gap={4}>
      {/* 項目名は読み飛ばされないよう、はっきりした濃さ・大きさで見せる（会員詳細と同じ）。 */}
      <Text fw={600} size="sm">
        {label}
      </Text>
      <Text fw={500} size="md" style={{ whiteSpace: "pre-wrap" }}>
        {value}
      </Text>
    </Stack>
  );
}

// 月額を「¥12,000」の形式へ整形する。
function formatMonthlyFee(value: number | undefined | null) {
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

// 契約ステータスごとにタイムラインの bullet アイコンを返す。
function subscriptionBullet(status: string | undefined | null) {
  if (status === "paused") return <Pause size={14} />;
  if (status === "ended") return <CircleSlash size={14} />;
  return <Check size={14} />;
}
