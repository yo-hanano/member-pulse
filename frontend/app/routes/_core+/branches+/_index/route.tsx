import { Breadcrumbs, Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import {
  type LoaderFunctionArgs,
  useLoaderData,
  useNavigation,
  useRevalidator,
} from "react-router";

import { type BranchListItemFragment, getSdk } from "~/generated/graphql";
import { useMasterAreas } from "~/hooks/useMasterData";
import { usePageData } from "~/hooks/usePageData";
import { buildChangedQueryPatch } from "~/lib/query-state";
import { BranchCreateModal } from "~/routes/_core+/branches+/_index/components/branch-create-modal";
import { BranchDeleteDialog } from "~/routes/_core+/branches+/_index/components/branch-delete-dialog";
import { BranchEditModal } from "~/routes/_core+/branches+/_index/components/branch-edit-modal";
import { BranchFiltersPanel } from "~/routes/_core+/branches+/_index/components/branch-filters-panel";
import { BranchListTable } from "~/routes/_core+/branches+/_index/components/branch-list-table";
import { useBranchDelete } from "~/routes/_core+/branches+/_index/hooks/useBranchDelete";
import {
  branchQueryParsers,
  branchQueryUrlKeys,
} from "~/routes/_core+/branches+/_index/query-state";
import { getGraphQLClient } from "~/services/graphql-client";

// 拠点一覧に必要なページデータだけを取得するローダー。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || undefined;
  const code = url.searchParams.get("code") || undefined;
  const areaId = url.searchParams.get("areaId") || undefined;
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const orderBy = url.searchParams.get("orderBy") || undefined;
  const orderDirection = url.searchParams.get("orderDirection") || undefined;

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { branchPagination } = await sdk.branchPage({
    pagination: {
      offset: (page - 1) * limit,
      limit,
      orderBy,
      orderDirection,
    },
    filter: { name, code, areaId },
  });

  return { branchPage: branchPagination };
};

export function meta() {
  return [{ title: "拠点一覧" }, { name: "description", content: "拠点管理" }];
}

// 拠点一覧画面本体。create/edit は modal 側へ寄せる。
export default function BranchesIndexRoute() {
  const { branchPage } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const { data: areas } = useMasterAreas();
  const {
    contents: branches,
    totalPages,
    totalCount,
  } = usePageData<BranchListItemFragment>(branchPage);

  const [{ nameFilter, codeFilter, areaFilter }, setQuery] = useQueryStates(branchQueryParsers, {
    urlKeys: branchQueryUrlKeys,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editBranchId, setEditBranchId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteBranchId, setDeleteBranchId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const deleteMutation = useBranchDelete(() => {
    setIsDeleteOpen(false);
    setDeleteBranchId(null);
    revalidator.revalidate();
  });

  const isProcessing =
    navigation.state !== "idle" || revalidator.state !== "idle" || deleteMutation.state !== "idle";

  // 一覧の検索条件（URLクエリ）を更新する。
  const updateParams = (updates: Record<string, string | null>) => {
    const shouldApplyImmediately = updates.name === null || updates.code === null;

    setQuery(
      buildChangedQueryPatch(
        updates,
        {
          page: "pageParam",
          limit: "limitParam",
          name: "nameFilter",
          code: "codeFilter",
          areaId: "areaFilter",
        },
        { numericKeys: ["pageParam", "limitParam"] },
      ),
      shouldApplyImmediately ? { limitUrlUpdates: undefined } : undefined,
    );
  };

  // 編集モーダルを開く。
  const openEdit = (branchIdValue: string) => {
    setEditBranchId(branchIdValue);
    setIsEditOpen(true);
  };

  // 削除確認モーダルを開く。
  const openDelete = (branchIdValue: string) => {
    setDeleteBranchId(branchIdValue);
    setIsDeleteOpen(true);
  };

  // 削除リクエスト送信。
  const submitDelete = () => {
    if (!deleteBranchId) return;
    deleteMutation.submit(undefined, [{ branchId: deleteBranchId }]);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Breadcrumbs className="mb-3 text-sm text-muted-foreground">
            <Breadcrumbs.Item href="/">ホーム</Breadcrumbs.Item>
            <Breadcrumbs.Item className="text-foreground">拠点</Breadcrumbs.Item>
          </Breadcrumbs>
          <h1 className="text-xl font-semibold tracking-tight">拠点一覧</h1>
          <p className="text-muted-foreground mt-1 text-xs">拠点情報を管理します。</p>
        </div>
        <Button className="app-primary-button" onPress={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          新規追加
        </Button>
      </div>

      <BranchFiltersPanel
        areaId={areaFilter}
        areas={areas ?? []}
        code={codeFilter}
        name={nameFilter}
        onFilterChange={updateParams}
      />

      <BranchListTable
        data={branches}
        isProcessing={isProcessing}
        totalCount={totalCount}
        totalPages={totalPages}
        onDelete={openDelete}
        onEdit={openEdit}
      />

      <BranchCreateModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <BranchEditModal
        branchId={editBranchId}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditBranchId(null);
        }}
      />

      <BranchDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteBranchId(null);
        }}
        isPending={deleteMutation.state !== "idle"}
        onConfirm={submitDelete}
      />
    </section>
  );
}
