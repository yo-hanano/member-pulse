import { Breadcrumbs, Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { type LoaderFunctionArgs, useLoaderData, useNavigation, useRevalidator } from "react-router";

import { type LeadListItemFragment, getSdk } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import { getGraphQLClient } from "~/services/graphql-client";
import { LeadCreateModal } from "~/routes/_core+/leads+/_index/components/lead-create-modal";
import { LeadDeleteDialog } from "~/routes/_core+/leads+/_index/components/lead-delete-dialog";
import { LeadEditModal } from "~/routes/_core+/leads+/_index/components/lead-edit-modal";
import { LeadFiltersPanel } from "~/routes/_core+/leads+/_index/components/lead-filters-panel";
import { LeadListTable } from "~/routes/_core+/leads+/_index/components/lead-list-table";
import { useLeadDelete } from "~/routes/_core+/leads+/_index/hooks/useLeadDelete";

// リード一覧に必要なページデータだけを取得するローダー。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const studentName = url.searchParams.get("studentName") || undefined;
  const guardianName = url.searchParams.get("guardianName") || undefined;
  const schoolName = url.searchParams.get("schoolName") || undefined;
  const channel = url.searchParams.get("channel") || undefined;
  const branchId = url.searchParams.get("branchId") || undefined;
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
      studentName,
      guardianName,
      schoolName,
      channel,
      inquiryAtFrom: buildDateTime(inquiryAtFrom, false),
      inquiryAtTo: buildDateTime(inquiryAtTo, true),
      branchId,
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
    navigation.state !== "idle" ||
    revalidator.state !== "idle" ||
    deleteMutation.submitting;

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
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Breadcrumbs className="mb-3 text-sm text-muted-foreground">
            <Breadcrumbs.Item href="/">ホーム</Breadcrumbs.Item>
            <Breadcrumbs.Item className="text-foreground">リード</Breadcrumbs.Item>
          </Breadcrumbs>
          <h1 className="text-xl font-semibold tracking-tight">リード一覧</h1>
          <p className="text-muted-foreground mt-1 text-xs">リード情報を管理します。</p>
        </div>
        <Button className="app-primary-button" onPress={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          新規追加
        </Button>
      </div>

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
    </section>
  );
}
