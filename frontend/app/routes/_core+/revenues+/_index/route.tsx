import {
  Anchor,
  Breadcrumbs,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  type ActionFunctionArgs,
  Link,
  type LoaderFunctionArgs,
  useLoaderData,
  useRevalidator,
} from "react-router";

import { getSdk, type RevenueRecordItemFragment } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { RevenueFiltersPanel } from "~/routes/_core+/revenues+/_index/components/revenue-filters-panel";
import { RevenueRecordDeleteDialog } from "~/routes/_core+/revenues+/_index/components/revenue-record-delete-dialog";
import { RevenueRecordFormModal } from "~/routes/_core+/revenues+/_index/components/revenue-record-form-modal";
import { RevenueRecordListTable } from "~/routes/_core+/revenues+/_index/components/revenue-record-list-table";
import { currentMonthValue } from "~/routes/_core+/revenues+/_index/query-state";
import { getGraphQLClient } from "~/services/graphql-client";

// 対象月の売上明細・サマリと、手入力フォーム用の会員一覧を取得するローダー。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const month = url.searchParams.get("month") || currentMonthValue();
  const locationId = url.searchParams.get("locationId") || undefined;
  const targetMonth = `${month}-01`;

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const [{ revenueRecordsByMonth }, { revenueSummary }, { allMembers }] = await Promise.all([
    sdk.revenueRecordsByMonth({ targetMonth, locationId }),
    sdk.revenueSummary({ targetMonth, locationId }),
    sdk.allMembers(),
  ]);

  return {
    month,
    records: (revenueRecordsByMonth ?? []).filter((record) => record != null),
    summary: revenueSummary,
    members: (allMembers ?? []).filter((member) => member != null),
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

type GenerateFeesForm = {
  intent: "generateFees";
  targetMonth: string;
};

type RevenueActionForm = RevenueRecordForm | DeleteRevenueForm | GenerateFeesForm;

// 売上画面から、手入力の登録・更新・削除と月謝の自動生成を受け付ける。
export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const form = (await request.json()) as RevenueActionForm;
  const client = getGraphQLClient();
  const sdk = getSdk(client);

  if (form.intent === "createRevenue" || form.intent === "updateRevenue") {
    const input = {
      locationId: form.locationId || undefined,
      memberId: form.memberId || undefined,
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

  if (form.intent === "generateFees") {
    const { generateMembershipFeeRevenues } = await sdk.generateMembershipFeeRevenues({
      targetMonth: form.targetMonth,
    });
    const count = generateMembershipFeeRevenues ?? 0;
    return {
      message: "ok",
      notify: {
        type: "success" as const,
        message:
          count > 0 ? `月謝売上を${count}件生成しました` : "生成対象の契約はありませんでした",
      },
    };
  }

  throw new Response("unknown intent", { status: 400 });
};

export type RevenueActionData = Awaited<ReturnType<typeof clientAction>>;

export function meta() {
  return [{ title: "売上" }, { name: "description", content: "売上管理" }];
}

// 売上台帳画面本体。対象月のサマリと明細、月謝自動生成・手入力の操作をまとめる。
export default function RevenuesIndexRoute() {
  const { month, records, summary, members } = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<RevenueRecordItemFragment | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);

  const mutation = useActionFetcher<RevenueActionData>({
    defaultAction: "/revenues",
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      setCreateOpen(false);
      setEditRecord(null);
      setDeleteRecordId(null);
      revalidator.revalidate();
    },
  });

  // 対象月の月謝売上を契約から生成する。生成済み契約はスキップされるため再実行しても安全。
  const submitGenerate = () => {
    mutation.submit({ intent: "generateFees", targetMonth: `${month}-01` });
  };

  // 削除確認ダイアログから削除を実行する。
  const submitDelete = () => {
    if (!deleteRecordId) return;
    mutation.submit({ intent: "deleteRevenue", revenueRecordId: deleteRecordId });
  };

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Breadcrumbs>
          <Anchor component={Link} c="dimmed" size="sm" to="/">
            ホーム
          </Anchor>
          <Text c="dimmed" size="sm">
            売上
          </Text>
        </Breadcrumbs>

        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={2}>売上</Title>
            <Text c="dimmed" size="sm">
              月謝と各種売上を台帳で管理します。月謝は契約から自動生成できます。
            </Text>
          </Stack>
          <Group gap="xs">
            <Button
              leftSection={<Sparkles size={16} />}
              loading={mutation.submitting}
              variant="default"
              onClick={submitGenerate}
            >
              月謝を生成
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              売上を追加
            </Button>
          </Group>
        </Group>
      </Stack>

      <RevenueFiltersPanel />

      {/* 対象月サマリ。仕様の MRR / 平均月謝 / 契約数 / 売上合計を1列で見せる。 */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <SummaryCard label="売上合計" value={formatAmount(summary?.totalAmount)} />
        <SummaryCard
          description={`月謝${summary?.membershipFeeCount ?? 0}件（課金契約数）`}
          label="月謝売上（MRR）"
          value={formatAmount(summary?.membershipFeeAmount)}
        />
        <SummaryCard label="平均月謝" value={formatAmount(summary?.averageMonthlyFee)} />
        <SummaryCard label="その他売上" value={formatAmount(summary?.otherAmount)} />
      </SimpleGrid>

      <RevenueRecordListTable
        records={records}
        onDelete={(recordId) => setDeleteRecordId(recordId)}
        onEdit={(record) => setEditRecord(record)}
      />

      <RevenueRecordFormModal
        members={members}
        month={month}
        mutation={mutation}
        opened={isCreateOpen}
        record={null}
        onClose={() => setCreateOpen(false)}
      />
      <RevenueRecordFormModal
        members={members}
        month={month}
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

// サマリカード。項目名と金額を縦に並べるだけの小さな表示部品。
function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <Paper p="md" radius="sm" shadow="xs" withBorder>
      <Stack gap={4}>
        <Text c="dimmed" fw={600} size="sm">
          {label}
        </Text>
        <Text fw={700} size="xl">
          {value}
        </Text>
        {description ? (
          <Text c="dimmed" size="xs">
            {description}
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}

// 金額を「¥12,000」の形式へ整形する。
function formatAmount(value: number | undefined | null) {
  if (value == null) return "-";
  return `¥${value.toLocaleString()}`;
}
