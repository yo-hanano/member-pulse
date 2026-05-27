import { Anchor, Breadcrumbs, Button, Group, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Link,
  type LoaderFunctionArgs,
  useLoaderData,
  useNavigation,
  useRevalidator,
} from "react-router";

import { getSdk, type LeadListItemFragment } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import { LeadCreateModal } from "~/routes/_core+/leads+/_index/components/lead-create-modal";
import { LeadDeleteDialog } from "~/routes/_core+/leads+/_index/components/lead-delete-dialog";
import { LeadEditModal } from "~/routes/_core+/leads+/_index/components/lead-edit-modal";
import { LeadFiltersPanel } from "~/routes/_core+/leads+/_index/components/lead-filters-panel";
import { LeadListTable } from "~/routes/_core+/leads+/_index/components/lead-list-table";
import { useLeadDelete } from "~/routes/_core+/leads+/_index/hooks/useLeadDelete";
import { getGraphQLClient } from "~/services/graphql-client";

// リード一覧に必要なページデータだけを取得するローダー。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || undefined;
  const source = url.searchParams.get("source") || undefined;
  const locationId = url.searchParams.get("locationId") || undefined;
  const inquiryAtFrom = url.searchParams.get("inquiryAtFrom") || undefined;
  const inquiryAtTo = url.searchParams.get("inquiryAtTo") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const orderBy = url.searchParams.get("orderBy") || undefined;
  const orderDirection = url.searchParams.get("orderDirection") || undefined;

  const buildDateTime = (value: string | undefined, isEndOfDay: boolean) => {
    if (!value) return undefined;
    return `${value}T${isEndOfDay ? "23:59" : "00:00"}`;
  };

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { leadPagination } = await sdk.leadPage({
    pagination: {
      offset: (page - 1) * limit,
      limit,
      orderBy,
      orderDirection,
    },
    filter: {
      name,
      source,
      locationId,
      inquiryAtFrom: buildDateTime(inquiryAtFrom, false),
      inquiryAtTo: buildDateTime(inquiryAtTo, true),
      status,
    },
  });

  return { leadPage: leadPagination };
};

export function meta() {
  return [{ title: "リード一覧" }, { name: "description", content: "リード管理" }];
}

// リード一覧画面本体。create/edit は modal 側へ寄せる。
export default function LeadsIndexRoute() {
  const { leadPage } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const { contents: leads, totalPages, totalCount } = usePageData<LeadListItemFragment>(leadPage);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editLeadId, setEditLeadId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const deleteMutation = useLeadDelete(() => {
    setIsDeleteOpen(false);
    setDeleteLeadId(null);
    revalidator.revalidate();
  });

  const isProcessing =
    navigation.state !== "idle" || revalidator.state !== "idle" || deleteMutation.submitting;

  // 編集モーダルを開く。
  const openEdit = (leadIdValue: string) => {
    setEditLeadId(leadIdValue);
    setIsEditOpen(true);
  };

  // 削除確認モーダルを開く。
  const openDelete = (leadIdValue: string) => {
    setDeleteLeadId(leadIdValue);
    setIsDeleteOpen(true);
  };

  // 削除リクエスト送信。
  const submitDelete = () => {
    if (!deleteLeadId) return;
    deleteMutation.submit(undefined, [{ leadId: deleteLeadId }]);
  };

  return (
    <Stack gap="lg">
      <Group align="flex-end" justify="space-between">
        <Stack gap={4}>
          <Breadcrumbs>
            <Anchor component={Link} c="dimmed" size="sm" to="/">
              ホーム
            </Anchor>
            <Text c="dimmed" size="sm">
              リード
            </Text>
          </Breadcrumbs>
          <Title order={2}>リード一覧</Title>
          <Text c="dimmed" size="sm">
            見込み客情報を管理します。
          </Text>
        </Stack>
        <Button
          leftSection={<Plus size={18} />}
          loading={isProcessing}
          onClick={() => setIsCreateOpen(true)}
        >
          リードを追加
        </Button>
      </Group>

      <LeadFiltersPanel />

      <LeadListTable
        data={leads}
        isProcessing={isProcessing}
        totalCount={totalCount}
        totalPages={totalPages}
        onDelete={openDelete}
        onEdit={openEdit}
      />

      <LeadCreateModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <LeadEditModal
        leadId={editLeadId}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditLeadId(null);
        }}
      />

      <LeadDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteLeadId(null);
        }}
        isPending={deleteMutation.submitting}
        onConfirm={submitDelete}
      />
    </Stack>
  );
}
