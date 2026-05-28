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

import { getSdk, type MemberListItemFragment } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import { MemberCreateModal } from "~/routes/_core+/members+/_index/components/member-create-modal";
import { MemberDeleteDialog } from "~/routes/_core+/members+/_index/components/member-delete-dialog";
import { MemberEditModal } from "~/routes/_core+/members+/_index/components/member-edit-modal";
import { MemberFiltersPanel } from "~/routes/_core+/members+/_index/components/member-filters-panel";
import { MemberListTable } from "~/routes/_core+/members+/_index/components/member-list-table";
import { useMemberDelete } from "~/routes/_core+/members+/_index/hooks/useMemberDelete";
import { getGraphQLClient } from "~/services/graphql-client";

// 会員一覧に必要なページデータだけを取得するローダー。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || undefined;
  const source = url.searchParams.get("source") || undefined;
  const locationId = url.searchParams.get("locationId") || undefined;
  const joinedAtFrom = url.searchParams.get("joinedAtFrom") || undefined;
  const joinedAtTo = url.searchParams.get("joinedAtTo") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const orderBy = url.searchParams.get("orderBy") || undefined;
  const orderDirection = url.searchParams.get("orderDirection") || undefined;

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { memberPagination } = await sdk.memberPage({
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
      joinedAtFrom,
      joinedAtTo,
      status,
    },
  });

  return { memberPage: memberPagination };
};

export function meta() {
  return [{ title: "会員一覧" }, { name: "description", content: "会員管理" }];
}

// 会員一覧画面本体。create/edit は modal 側へ寄せる。
export default function MembersIndexRoute() {
  const { memberPage } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const {
    contents: members,
    totalPages,
    totalCount,
  } = usePageData<MemberListItemFragment>(memberPage);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const deleteMutation = useMemberDelete(() => {
    setIsDeleteOpen(false);
    setDeleteMemberId(null);
    revalidator.revalidate();
  });

  const isProcessing =
    navigation.state !== "idle" || revalidator.state !== "idle" || deleteMutation.submitting;

  // 編集モーダルを開く。
  const openEdit = (memberIdValue: string) => {
    setEditMemberId(memberIdValue);
    setIsEditOpen(true);
  };

  // 削除確認モーダルを開く。
  const openDelete = (memberIdValue: string) => {
    setDeleteMemberId(memberIdValue);
    setIsDeleteOpen(true);
  };

  // 削除リクエスト送信。
  const submitDelete = () => {
    if (!deleteMemberId) return;
    deleteMutation.submit(undefined, [{ memberId: deleteMemberId }]);
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
              会員
            </Text>
          </Breadcrumbs>
          <Title order={2}>会員一覧</Title>
          <Text c="dimmed" size="sm">
            会員の基本情報を管理します。
          </Text>
        </Stack>
        <Button
          leftSection={<Plus size={18} />}
          loading={isProcessing}
          onClick={() => setIsCreateOpen(true)}
        >
          会員を追加
        </Button>
      </Group>

      <MemberFiltersPanel />

      <MemberListTable
        data={members}
        isProcessing={isProcessing}
        totalCount={totalCount}
        totalPages={totalPages}
        onDelete={openDelete}
        onEdit={openEdit}
      />

      <MemberCreateModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <MemberEditModal
        memberId={editMemberId}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditMemberId(null);
        }}
      />

      <MemberDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteMemberId(null);
        }}
        isPending={deleteMutation.submitting}
        onConfirm={submitDelete}
      />
    </Stack>
  );
}
