import { Anchor, Breadcrumbs, Button, Group, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  type LoaderFunctionArgs,
  useLoaderData,
  useNavigation,
  useRevalidator,
} from "react-router";

import { type AreaListItemFragment, getSdk } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import { buildChangedQueryPatch } from "~/lib/query-state";
import { AreaCreateModal } from "~/routes/_core+/areas+/_index/components/area-create-modal";
import { AreaDeleteDialog } from "~/routes/_core+/areas+/_index/components/area-delete-dialog";
import { AreaEditModal } from "~/routes/_core+/areas+/_index/components/area-edit-modal";
import { AreaFiltersPanel } from "~/routes/_core+/areas+/_index/components/area-filters-panel";
import { AreaListTable } from "~/routes/_core+/areas+/_index/components/area-list-table";
import { useAreaDelete } from "~/routes/_core+/areas+/_index/hooks/useAreaDelete";
import { useAreaOrderUpdate } from "~/routes/_core+/areas+/_index/hooks/useAreaOrderUpdate";
import { areaQueryParsers, areaQueryUrlKeys } from "~/routes/_core+/areas+/_index/query-state";
import { getGraphQLClient } from "~/services/graphql-client";

// エリア一覧に必要な初期データを取得するローダー。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || undefined;
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const orderBy = url.searchParams.get("orderBy") || "display_order";
  const orderDirection = url.searchParams.get("orderDirection") || "asc";

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { areaPagination } = await sdk.areaPage({
    pagination: {
      offset: (page - 1) * limit,
      limit,
      orderBy,
      orderDirection,
    },
    filter: { name },
  });

  return { areaPage: areaPagination };
};

// エリア一覧画面本体。create/edit は modal 側へ寄せる。
export default function AreasIndexRoute() {
  const { areaPage } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const { contents: areas, totalPages, totalCount } = usePageData<AreaListItemFragment>(areaPage);

  const [{ pageParam, limitParam, nameFilter }, setQuery] = useQueryStates(areaQueryParsers, {
    urlKeys: areaQueryUrlKeys,
  });

  const [orderedAreas, setOrderedAreas] = useState<AreaListItemFragment[]>(areas);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editAreaId, setEditAreaId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteAreaId, setDeleteAreaId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const deleteMutation = useAreaDelete(() => {
    setIsDeleteOpen(false);
    setDeleteAreaId(null);
    revalidator.revalidate();
  });
  const orderMutation = useAreaOrderUpdate(() => {
    setHasOrderChanges(false);
    revalidator.revalidate();
  });

  const isProcessing =
    navigation.state !== "idle" ||
    revalidator.state !== "idle" ||
    deleteMutation.state !== "idle" ||
    orderMutation.state !== "idle";

  // ローダー再取得時に並び順編集中データを初期化する。
  useEffect(() => {
    setOrderedAreas(areas);
    setHasOrderChanges(false);
  }, [areas]);

  // 一覧の検索条件（URLクエリ）を更新する。
  const updateParams = (updates: Record<string, string | null>) => {
    const shouldApplyImmediately = updates.name === null;

    setQuery(
      buildChangedQueryPatch(
        updates,
        {
          page: "pageParam",
          limit: "limitParam",
          name: "nameFilter",
        },
        { numericKeys: ["pageParam", "limitParam"] },
      ),
      shouldApplyImmediately ? { limitUrlUpdates: undefined } : undefined,
    );
  };

  // 編集モーダルを開く。
  const openEdit = (areaId: string) => {
    setEditAreaId(areaId);
    setIsEditOpen(true);
  };

  // 削除確認モーダルを開く。
  const openDelete = (areaId: string) => {
    setDeleteAreaId(areaId);
    setIsDeleteOpen(true);
  };

  // D&D で並び替えた結果を一覧状態へ反映する。
  const reorderAreas = (next: AreaListItemFragment[]) => {
    setOrderedAreas(next);
    setHasOrderChanges(true);
  };

  const pageNo = pageParam ?? 1;
  const limitNo = limitParam ?? 10;
  const offset = (pageNo - 1) * limitNo;
  const orderPayload = useMemo(
    () =>
      orderedAreas
        .filter((area) => area.id)
        .map((area, index) => ({
          id: String(area.id),
          dispOrder: offset + index + 1,
        })),
    [offset, orderedAreas],
  );

  // 削除リクエスト送信。
  const submitDelete = () => {
    if (!deleteAreaId) return;
    deleteMutation.submit(undefined, [{ areaId: deleteAreaId }]);
  };

  // 並び順更新リクエスト送信。
  const submitOrder = () => {
    orderMutation.submit(orderPayload);
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
              エリア
            </Text>
          </Breadcrumbs>
          <Title order={2}>エリア一覧</Title>
          <Text c="dimmed" size="sm">
            エリア情報と表示順を管理します。
          </Text>
        </Stack>
        <Group gap="sm">
          <Button
            disabled={!hasOrderChanges || isProcessing}
            variant="default"
            onClick={submitOrder}
          >
            {orderMutation.state !== "idle" ? "保存中..." : "並び順を保存"}
          </Button>
          <Button leftSection={<Plus size={18} />} onClick={() => setIsCreateOpen(true)}>
            エリアを追加
          </Button>
        </Group>
      </Group>

      <AreaFiltersPanel name={nameFilter} onFilterChange={updateParams} />

      <AreaListTable
        data={orderedAreas}
        isProcessing={isProcessing}
        totalCount={totalCount}
        totalPages={totalPages}
        onDelete={openDelete}
        onEdit={openEdit}
        onReorder={reorderAreas}
      />

      <AreaCreateModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <AreaEditModal
        areaId={editAreaId}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditAreaId(null);
        }}
      />

      <AreaDeleteDialog
        isOpen={isDeleteOpen}
        isPending={deleteMutation.state !== "idle"}
        onConfirm={submitDelete}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteAreaId(null);
        }}
      />
    </Stack>
  );
}
