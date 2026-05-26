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

import { getSdk, type StudentListItemFragment } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import { buildChangedQueryPatch } from "~/lib/query-state";
import { StudentCreateModal } from "~/routes/_core+/students+/_index/components/student-create-modal";
import { StudentDeleteDialog } from "~/routes/_core+/students+/_index/components/student-delete-dialog";
import { StudentEditModal } from "~/routes/_core+/students+/_index/components/student-edit-modal";
import { StudentFiltersPanel } from "~/routes/_core+/students+/_index/components/student-filters-panel";
import { StudentListTable } from "~/routes/_core+/students+/_index/components/student-list-table";
import { useStudentDelete } from "~/routes/_core+/students+/_index/hooks/useStudentDelete";
import {
  studentQueryParsers,
  studentQueryUrlKeys,
} from "~/routes/_core+/students+/_index/query-state";
import { getGraphQLClient } from "~/services/graphql-client";

// 生徒一覧に必要なページデータだけを取得するローダー。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || undefined;
  const name = url.searchParams.get("name") || undefined;
  const kana = url.searchParams.get("kana") || undefined;
  const branchId = url.searchParams.get("branchId") || undefined;
  const schoolName = url.searchParams.get("schoolName") || undefined;
  const schoolTypeCode = url.searchParams.get("schoolTypeCode") || undefined;
  const schoolGradeCode = url.searchParams.get("schoolGradeCode") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const orderBy = url.searchParams.get("orderBy") || undefined;
  const orderDirection = url.searchParams.get("orderDirection") || undefined;

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { studentPagination } = await sdk.studentPage({
    pagination: {
      offset: (page - 1) * limit,
      limit,
      orderBy,
      orderDirection,
    },
    filter: { code, name, kana, branchId, schoolName, schoolTypeCode, schoolGradeCode, status },
  });

  return { studentPage: studentPagination };
};

export function meta() {
  return [{ title: "生徒一覧" }, { name: "description", content: "生徒管理" }];
}

// 生徒一覧画面本体。create/edit は modal 側へ寄せる。
export default function StudentsIndexRoute() {
  const { studentPage } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const {
    contents: students,
    totalPages,
    totalCount,
  } = usePageData<StudentListItemFragment>(studentPage);

  const [
    {
      codeFilter,
      nameFilter,
      kanaFilter,
      branchIdFilter,
      schoolNameFilter,
      schoolTypeCodeFilter,
      schoolGradeCodeFilter,
      statusFilter,
    },
    setQuery,
  ] = useQueryStates(studentQueryParsers, {
    urlKeys: studentQueryUrlKeys,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const deleteMutation = useStudentDelete(() => {
    setIsDeleteOpen(false);
    setDeleteStudentId(null);
    revalidator.revalidate();
  });

  const isProcessing =
    navigation.state !== "idle" || revalidator.state !== "idle" || deleteMutation.state !== "idle";

  // 一覧の検索条件（URLクエリ）を更新する。
  const updateParams = (updates: Record<string, string | null>) => {
    const shouldApplyImmediately =
      updates.code === null ||
      updates.name === null ||
      updates.kana === null ||
      updates.schoolName === null ||
      updates.schoolGradeCode === null;

    setQuery(
      buildChangedQueryPatch(
        updates,
        {
          page: "pageParam",
          limit: "limitParam",
          code: "codeFilter",
          name: "nameFilter",
          kana: "kanaFilter",
          branchId: "branchIdFilter",
          schoolName: "schoolNameFilter",
          schoolTypeCode: "schoolTypeCodeFilter",
          schoolGradeCode: "schoolGradeCodeFilter",
          status: "statusFilter",
        },
        { numericKeys: ["pageParam", "limitParam"] },
      ),
      shouldApplyImmediately ? { limitUrlUpdates: undefined } : undefined,
    );
  };

  // 編集モーダルを開く。
  const openEdit = (studentIdValue: string) => {
    setEditStudentId(studentIdValue);
    setIsEditOpen(true);
  };

  // 削除確認モーダルを開く。
  const openDelete = (studentIdValue: string) => {
    setDeleteStudentId(studentIdValue);
    setIsDeleteOpen(true);
  };

  // 削除リクエスト送信。
  const submitDelete = () => {
    if (!deleteStudentId) return;
    deleteMutation.submit(undefined, [{ studentId: deleteStudentId }]);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Breadcrumbs className="mb-3 text-sm text-muted-foreground">
            <Breadcrumbs.Item href="/">ホーム</Breadcrumbs.Item>
            <Breadcrumbs.Item className="text-foreground">生徒</Breadcrumbs.Item>
          </Breadcrumbs>
          <h1 className="text-xl font-semibold tracking-tight">生徒一覧</h1>
          <p className="text-muted-foreground mt-1 text-xs">生徒情報を管理します。</p>
        </div>
        <Button className="app-primary-button" onPress={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          新規追加
        </Button>
      </div>

      <StudentFiltersPanel
        code={codeFilter}
        branchId={branchIdFilter}
        schoolGradeCode={schoolGradeCodeFilter}
        kana={kanaFilter}
        name={nameFilter}
        schoolName={schoolNameFilter}
        schoolTypeCode={schoolTypeCodeFilter}
        status={statusFilter}
        onFilterChange={updateParams}
      />

      <StudentListTable
        data={students}
        isProcessing={isProcessing}
        totalCount={totalCount}
        totalPages={totalPages}
        onDelete={openDelete}
        onEdit={openEdit}
      />

      <StudentCreateModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <StudentEditModal
        studentId={editStudentId}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditStudentId(null);
        }}
      />

      <StudentDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteStudentId(null);
        }}
        isPending={deleteMutation.state !== "idle"}
        onConfirm={submitDelete}
      />
    </section>
  );
}
