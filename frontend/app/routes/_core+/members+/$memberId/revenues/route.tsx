import {
  ActionIcon,
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
import { ArrowLeft, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useRevalidator,
} from "react-router";

import { getSdk, type RevenueRecordItemFragment } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { formatDateYmd } from "~/lib/date";
import type { MemberDetailContext } from "~/routes/_core+/members+/$memberId/route";
import { RevenueRecordDeleteDialog } from "~/routes/_core+/revenues+/_index/components/revenue-record-delete-dialog";
import { RevenueRecordFormModal } from "~/routes/_core+/revenues+/_index/components/revenue-record-form-modal";
import {
  formatRevenueSourceType,
  formatRevenueType,
  revenueTypeBadgeColor,
} from "~/routes/_core+/revenues+/_index/revenue-type";
import { getGraphQLClient } from "~/services/graphql-client";

// 会員の売上明細を全期間・新しい順で取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const memberId = params.memberId;
  if (!memberId) {
    throw new Response("memberId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { revenueRecordsByMemberId } = await sdk.revenueRecordsByMemberId({ memberId });

  return {
    records: (revenueRecordsByMemberId ?? []).filter((record) => record != null),
  };
};

type RevenueRecordForm = {
  intent: "createRevenue" | "updateRevenue";
  revenueRecordId?: string;
  locationId?: string;
  memberId?: string;
  revenueDate: string;
  revenueType: string;
  amount: number;
  note?: string;
};

type DeleteRevenueForm = {
  intent: "deleteRevenue";
  revenueRecordId: string;
};

type MemberRevenueActionForm = RevenueRecordForm | DeleteRevenueForm;

// 会員の売上タブから、スポット売上の登録・更新・削除を受け付ける。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const memberId = params.memberId;
  if (!memberId) {
    throw new Response("memberId is required", { status: 400 });
  }

  const form = (await request.json()) as MemberRevenueActionForm;
  const client = getGraphQLClient();
  const sdk = getSdk(client);

  if (form.intent === "createRevenue" || form.intent === "updateRevenue") {
    const input = {
      locationId: form.locationId || undefined,
      // この画面からの登録は常に対象会員の売上として扱う。
      memberId,
      revenueDate: form.revenueDate,
      revenueType: form.revenueType,
      amount: form.amount,
      note: form.note || undefined,
    };

    if (form.intent === "createRevenue") {
      const { createRevenueRecord } = await sdk.createRevenueRecord({ input });
      return {
        message: createRevenueRecord ? "ok" : "ng",
        notify: createRevenueRecord
          ? { type: "success" as const, message: "売上を登録しました" }
          : { type: "error" as const, message: "売上の登録に失敗しました" },
      };
    }

    if (!form.revenueRecordId) {
      throw new Response("revenueRecordId is required", { status: 400 });
    }
    const { updateRevenueRecord } = await sdk.updateRevenueRecord({
      revenueRecordId: form.revenueRecordId,
      input,
    });
    return {
      message: updateRevenueRecord ? "ok" : "ng",
      notify: updateRevenueRecord
        ? { type: "success" as const, message: "売上を更新しました" }
        : { type: "error" as const, message: "売上の更新に失敗しました" },
    };
  }

  if (form.intent === "deleteRevenue") {
    const { deleteRevenueRecord } = await sdk.deleteRevenueRecord({
      revenueRecordId: form.revenueRecordId,
    });
    return {
      message: deleteRevenueRecord ? "ok" : "ng",
      notify: deleteRevenueRecord
        ? { type: "success" as const, message: "売上を削除しました" }
        : { type: "error" as const, message: "売上の削除に失敗しました" },
    };
  }

  throw new Response("unknown intent", { status: 400 });
};

export type MemberRevenueActionData = Awaited<ReturnType<typeof clientAction>>;

// 会員詳細の売上タブ。この会員の売上台帳と、スポット売上（入会金・物販等）の登録をまとめる。
export default function MemberRevenuesRoute() {
  const { member } = useOutletContext<MemberDetailContext>();
  const { records } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<RevenueRecordItemFragment | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);

  // モーダル側は action 上書きなしで submit するため、defaultAction は固定文字列で持つ。
  const mutation = useActionFetcher<MemberRevenueActionData>({
    defaultAction: `/members/${member.id}/revenues`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      setCreateOpen(false);
      setEditRecord(null);
      setDeleteRecordId(null);
      revalidator.revalidate();
    },
  });

  // 削除確認ダイアログから削除を実行する。
  const submitDelete = () => {
    if (!deleteRecordId) return;
    mutation.submit({ intent: "deleteRevenue", revenueRecordId: deleteRecordId });
  };

  // 累計サマリ。LTV 判断の手がかりとして月謝とその他を分けて見せる。
  const totalAmount = sumAmount(records);
  const membershipFeeAmount = sumAmount(
    records.filter((record) => record.revenueType === "membership_fee"),
  );

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

      <Paper p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="md">
          {/* 他タブと同じカード内ヘッダー文法に合わせる。 */}
          <Group justify="space-between">
            <Group gap="sm">
              <ThemeIcon color="brand" radius="sm" variant="light">
                <Receipt size={18} />
              </ThemeIcon>
              <Stack gap={0}>
                <Title order={3} size="h4">
                  売上台帳
                </Title>
                <Text c="dimmed" size="sm">
                  この会員の月謝とスポット売上の記録
                </Text>
              </Stack>
            </Group>
            <Button leftSection={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              スポット売上を追加
            </Button>
          </Group>

          <Group gap="xl">
            <SummaryItem label="累計売上" value={formatAmount(totalAmount)} />
            <SummaryItem label="月謝" value={formatAmount(membershipFeeAmount)} />
            <SummaryItem label="その他" value={formatAmount(totalAmount - membershipFeeAmount)} />
          </Group>

          {records.length === 0 ? (
            <Text c="dimmed" size="sm">
              売上はまだありません。月謝は売上画面の「月謝を生成」、入会金・物販などは「スポット売上を追加」から登録できます。
            </Text>
          ) : (
            <Box className="overflow-x-auto">
              <Table highlightOnHover miw={640} verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={120}>
                      <Text fw={700} size="sm">
                        売上日
                      </Text>
                    </Table.Th>
                    <Table.Th w={100}>
                      <Text fw={700} size="sm">
                        種別
                      </Text>
                    </Table.Th>
                    <Table.Th ta="right" w={130}>
                      <Text fw={700} size="sm">
                        金額
                      </Text>
                    </Table.Th>
                    <Table.Th w={90}>
                      <Text fw={700} size="sm">
                        入力元
                      </Text>
                    </Table.Th>
                    <Table.Th>
                      <Text fw={700} size="sm">
                        メモ
                      </Text>
                    </Table.Th>
                    <Table.Th ta="center" w={100}>
                      操作
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {records.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Text size="sm">{formatDateYmd(record.revenueDate)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={revenueTypeBadgeColor(record.revenueType)}
                          radius="sm"
                          variant="light"
                        >
                          {formatRevenueType(record.revenueType)}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text fw={600} size="sm">
                          {record.amount != null ? formatAmount(record.amount) : "-"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={record.sourceType === "auto" ? "teal" : "gray"}
                          radius="sm"
                          variant="outline"
                        >
                          {formatRevenueSourceType(record.sourceType)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text c="dimmed" lineClamp={1} size="sm">
                          {record.note ?? "-"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center" wrap="nowrap">
                          <Tooltip label="編集">
                            <ActionIcon
                              aria-label="売上を編集"
                              variant="subtle"
                              onClick={() => setEditRecord(record)}
                            >
                              <Pencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="削除">
                            <ActionIcon
                              aria-label="売上を削除"
                              color="red"
                              variant="subtle"
                              onClick={() => record.id && setDeleteRecordId(record.id)}
                            >
                              <Trash2 size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          )}
        </Stack>
      </Paper>

      <RevenueRecordFormModal
        fixedMember={member.id ? { id: String(member.id), locationId: member.locationId } : null}
        mutation={mutation}
        opened={isCreateOpen}
        record={null}
        onClose={() => setCreateOpen(false)}
      />
      <RevenueRecordFormModal
        fixedMember={member.id ? { id: String(member.id), locationId: member.locationId } : null}
        mutation={mutation}
        opened={editRecord != null}
        record={editRecord}
        onClose={() => setEditRecord(null)}
      />
      <RevenueRecordDeleteDialog
        isOpen={deleteRecordId != null}
        isPending={mutation.submitting}
        onConfirm={submitDelete}
        onOpenChange={(open) => {
          if (!open) setDeleteRecordId(null);
        }}
      />
    </Stack>
  );
}

// 累計サマリの1項目。項目名と金額を縦に並べる小さな表示部品。
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

// 金額を「¥12,000」の形式へ整形する。
function formatAmount(value: number | undefined | null) {
  if (value == null) return "-";
  return `¥${value.toLocaleString()}`;
}

// 明細の金額合計を返す。
function sumAmount(records: RevenueRecordItemFragment[]) {
  return records.reduce((total, record) => total + (record.amount ?? 0), 0);
}
