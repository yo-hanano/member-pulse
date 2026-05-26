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

import { getSdk, type TeacherListItemFragment } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import { buildChangedQueryPatch } from "~/lib/query-state";
import { TeacherCreateModal } from "~/routes/_core+/teachers+/_index/components/teacher-create-modal";
import { TeacherDeleteDialog } from "~/routes/_core+/teachers+/_index/components/teacher-delete-dialog";
import { TeacherEditModal } from "~/routes/_core+/teachers+/_index/components/teacher-edit-modal";
import { TeacherFiltersPanel } from "~/routes/_core+/teachers+/_index/components/teacher-filters-panel";
import { TeacherListTable } from "~/routes/_core+/teachers+/_index/components/teacher-list-table";
import { useTeacherDelete } from "~/routes/_core+/teachers+/_index/hooks/useTeacherDelete";
import {
  teacherQueryParsers,
  teacherQueryUrlKeys,
} from "~/routes/_core+/teachers+/_index/query-state";
import { getGraphQLClient } from "~/services/graphql-client";

// 講師一覧に必要なページデータだけを取得するローダー。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || undefined;
  const name = url.searchParams.get("name") || undefined;
  const kana = url.searchParams.get("kana") || undefined;
  const genderCode = url.searchParams.get("genderCode") || undefined;
  const schoolName = url.searchParams.get("schoolName") || undefined;
  const schoolGradeCode = url.searchParams.get("schoolGradeCode") || undefined;
  const phone = url.searchParams.get("phone") || undefined;
  const email = url.searchParams.get("email") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const orderBy = url.searchParams.get("orderBy") || undefined;
  const orderDirection = url.searchParams.get("orderDirection") || undefined;

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { teacherPagination } = await sdk.teacherPage({
    pagination: {
      offset: (page - 1) * limit,
      limit,
      orderBy,
      orderDirection,
    },
    filter: { code, name, kana, genderCode, schoolName, schoolGradeCode, phone, email, status },
  });

  return { teacherPage: teacherPagination };
};

export function meta() {
  return [{ title: "講師一覧" }, { name: "description", content: "講師管理" }];
}

// 講師一覧画面本体。create/edit は modal 側へ寄せる。
export default function TeachersIndexRoute() {
  const { teacherPage } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const {
    contents: teachers,
    totalPages,
    totalCount,
  } = usePageData<TeacherListItemFragment>(teacherPage);

  const [
    {
      codeFilter,
      nameFilter,
      kanaFilter,
      genderCodeFilter,
      schoolNameFilter,
      schoolGradeCodeFilter,
      phoneFilter,
      emailFilter,
      statusFilter,
    },
    setQuery,
  ] = useQueryStates(teacherQueryParsers, {
    urlKeys: teacherQueryUrlKeys,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTeacherId, setEditTeacherId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTeacherId, setDeleteTeacherId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const deleteMutation = useTeacherDelete(() => {
    setIsDeleteOpen(false);
    setDeleteTeacherId(null);
    revalidator.revalidate();
  });

  const isProcessing =
    navigation.state !== "idle" || revalidator.state !== "idle" || deleteMutation.state !== "idle";

  // 一覧の検索条件（URLクエリ）を更新する。
  const updateParams = (updates: Record<string, string | null>) => {
    setQuery(
      buildChangedQueryPatch(
        updates,
        {
          page: "pageParam",
          limit: "limitParam",
          code: "codeFilter",
          name: "nameFilter",
          kana: "kanaFilter",
          genderCode: "genderCodeFilter",
          schoolName: "schoolNameFilter",
          schoolGradeCode: "schoolGradeCodeFilter",
          phone: "phoneFilter",
          email: "emailFilter",
          status: "statusFilter",
        },
        { numericKeys: ["pageParam", "limitParam"] },
      ),
    );
  };

  // 編集モーダルを開く。
  const openEdit = (teacherIdValue: string) => {
    setEditTeacherId(teacherIdValue);
    setIsEditOpen(true);
  };

  // 削除確認モーダルを開く。
  const openDelete = (teacherIdValue: string) => {
    setDeleteTeacherId(teacherIdValue);
    setIsDeleteOpen(true);
  };

  // 削除リクエスト送信。
  const submitDelete = () => {
    if (!deleteTeacherId) return;
    deleteMutation.submit(undefined, [{ teacherId: deleteTeacherId }]);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Breadcrumbs className="mb-3 text-sm text-muted-foreground">
            <Breadcrumbs.Item href="/">ホーム</Breadcrumbs.Item>
            <Breadcrumbs.Item className="text-foreground">講師</Breadcrumbs.Item>
          </Breadcrumbs>
          <h1 className="text-xl font-semibold tracking-tight">講師一覧</h1>
          <p className="text-muted-foreground mt-1 text-xs">講師情報を管理します。</p>
        </div>
        <Button className="app-primary-button" onPress={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          新規追加
        </Button>
      </div>

      <TeacherFiltersPanel
        code={codeFilter}
        email={emailFilter}
        genderCode={genderCodeFilter}
        kana={kanaFilter}
        name={nameFilter}
        phone={phoneFilter}
        schoolGradeCode={schoolGradeCodeFilter}
        schoolName={schoolNameFilter}
        status={statusFilter}
        onFilterChange={updateParams}
      />

      <TeacherListTable
        data={teachers}
        isProcessing={isProcessing}
        totalCount={totalCount}
        totalPages={totalPages}
        onDelete={openDelete}
        onEdit={openEdit}
      />

      <TeacherCreateModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <TeacherEditModal
        isOpen={isEditOpen}
        teacherId={editTeacherId}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditTeacherId(null);
        }}
      />

      <TeacherDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteTeacherId(null);
        }}
        isPending={deleteMutation.state !== "idle"}
        onConfirm={submitDelete}
      />
    </section>
  );
}
