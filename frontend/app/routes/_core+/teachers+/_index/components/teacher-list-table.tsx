import { Button, Chip, ListBox, Pagination, Select, Table } from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";
import type { Key, ReactNode } from "react";
import { useMemo } from "react";

import { TableLoadingShell } from "~/components/table/table-loading-shell";
import { formatDateYmd } from "~/lib/date";
import { getPageNumbers, renderSortIcon, toSortingState } from "~/components/table/table-utils";
import type { TeacherListItemFragment } from "~/generated/graphql";
import { useMasterGenders, useMasterSchoolGrades } from "~/hooks/useMasterData";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { teacherQueryParsers, teacherQueryUrlKeys } from "~/routes/_core+/teachers+/_index/query-state";
import { teacherStatusLabel } from "~/routes/_core+/teachers+/_index/teacher-status";

const pageSizeOptions = [10, 20, 50, 100] as const;

type TeacherColumn = {
  id: string;
  label: string;
  sortable: boolean;
  isRowHeader?: boolean;
  renderCell: (teacher: TeacherListItemFragment) => ReactNode;
};

interface Props {
  data: TeacherListItemFragment[];
  isProcessing?: boolean;
  totalPages: number;
  totalCount?: number;
  onEdit: (teacherId: string) => void;
  onDelete: (teacherId: string) => void;
}

// 講師一覧テーブルを表示し、編集・削除アクションを提供する。
export function TeacherListTable({
  data,
  isProcessing,
  totalPages,
  totalCount,
  onEdit,
  onDelete,
}: Props) {
  const stableTeachers = useMemo(() => data.filter((teacher) => teacher.id != null), [data]);
  const { data: genders } = useMasterGenders();
  const { data: schoolGrades } = useMasterSchoolGrades();
  const genderNameByCode = useMemo(
    () => new Map((genders ?? []).map((gender) => [gender.code ?? "", gender.name ?? gender.code ?? ""])),
    [genders],
  );
  const schoolGradeNameByCode = useMemo(
    () => new Map((schoolGrades ?? []).map((grade) => [grade.code ?? "", grade.name ?? grade.code ?? ""])),
    [schoolGrades],
  );

  const { page: pageNo, limit: limitNo, sortDescriptor, setPage, setSorting } = useTableSearchParams({
    parsers: teacherQueryParsers,
    urlKeys: teacherQueryUrlKeys,
  });

  const columns: TeacherColumn[] = useMemo(
    () => [
      {
        id: "code",
        label: "講師NO",
        sortable: true,
        renderCell: (teacher) => teacher.code ?? "-",
      },
      {
        id: "name",
        label: "名前",
        sortable: true,
        isRowHeader: true,
        renderCell: (teacher) => teacher.name ?? "-",
      },
      {
        id: "kana",
        label: "フリガナ",
        sortable: true,
        renderCell: (teacher) => teacher.kana ?? "-",
      },
      {
        id: "birthday",
        label: "誕生日",
        sortable: true,
        renderCell: (teacher) => formatDateYmd(teacher.birthday),
      },
      {
        id: "genderCode",
        label: "性別",
        sortable: true,
        renderCell: (teacher) => {
          const code = teacher.genderCode ?? "";
          return genderNameByCode.get(code) ?? teacher.genderCode ?? "-";
        },
      },
      {
        id: "schoolName",
        label: "所属学校",
        sortable: true,
        renderCell: (teacher) => teacher.schoolName ?? "-",
      },
      {
        id: "schoolGradeCode",
        label: "学年",
        sortable: true,
        renderCell: (teacher) => {
          const code = teacher.schoolGradeCode ?? "";
          return schoolGradeNameByCode.get(code) ?? teacher.schoolGradeCode ?? "-";
        },
      },
      {
        id: "phone",
        label: "電話番号",
        sortable: true,
        renderCell: (teacher) => teacher.phone ?? "-",
      },
      {
        id: "email",
        label: "メールアドレス",
        sortable: true,
        renderCell: (teacher) => teacher.email ?? "-",
      },
      {
        id: "status",
        label: "在籍状態",
        sortable: true,
        renderCell: (teacher) => <Chip size="sm" variant="soft">{teacherStatusLabel(teacher.status)}</Chip>,
      },
    ],
    [genderNameByCode, schoolGradeNameByCode],
  );

  const pageNumbers = getPageNumbers(pageNo, totalPages);
  const start = (pageNo - 1) * limitNo + 1;
  const end = Math.min(pageNo * limitNo, totalCount ?? 0);

  return (
    <div className="space-y-2">
      <Pagination className="w-full items-center" size="sm">
        <Pagination.Summary className="flex items-center pl-2">
          <span className="text-small font-medium leading-none text-default-foreground">
            {(totalCount ?? 0) === 0 ? "0件" : `${start} - ${end} / ${totalCount ?? 0}件`}
          </span>
        </Pagination.Summary>
        <Pagination.Content className="items-center">
          <Pagination.Item>
            <Select
              aria-label="1ページあたりの表示件数"
              isDisabled={isProcessing}
              variant="secondary"
              value={String(limitNo)}
              onChange={(key: Key | Key[] | null) => setPage(1, Number(String(key ?? "10")))}
            >
              <Select.Trigger className="h-8 min-w-[96px]">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {pageSizeOptions.map((size) => (
                    <ListBox.Item id={String(size)} key={size} textValue={`${size}件`}>
                      {size}件
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={pageNo <= 1}
              onPress={() => setPage(Math.max(1, pageNo - 1), limitNo)}
            >
              <Pagination.PreviousIcon />
              <span>前へ</span>
            </Pagination.Previous>
          </Pagination.Item>
          {pageNumbers.map((p, idx) =>
            p === "ellipsis" ? (
              <Pagination.Item key={`ellipsis-${idx}`}>
                <Pagination.Ellipsis />
              </Pagination.Item>
            ) : (
              <Pagination.Item key={p}>
                <Pagination.Link isActive={p === pageNo} onPress={() => setPage(p, limitNo)}>
                  {p}
                </Pagination.Link>
              </Pagination.Item>
            ),
          )}
          <Pagination.Item>
            <Pagination.Next
              isDisabled={pageNo >= totalPages}
              onPress={() => setPage(Math.min(totalPages, pageNo + 1), limitNo)}
            >
              <span>次へ</span>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
      <TableLoadingShell isLoading={isProcessing}>
        <Table className={isProcessing ? "bg-surface opacity-70 transition-opacity" : "bg-surface transition-opacity"}>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="teachers table"
              sortDescriptor={sortDescriptor}
              onSortChange={(descriptor) => setSorting(toSortingState(descriptor))}
            >
              <Table.Header>
                {columns.map((column, index) => (
                  <Table.Column
                    key={column.id}
                    id={column.id}
                    allowsSorting={column.sortable}
                    className={[
                      column.sortable ? "cursor-pointer select-none" : "",
                      "border-r border-separator/60",
                      index === 0 ? "border-l border-separator/60" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    isRowHeader={column.isRowHeader}
                  >
                    {({ sortDirection }) => {
                      if (!column.sortable) return <span className="text-xs sm:text-sm">{column.label}</span>;
                      return (
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm">
                          <span>{column.label}</span>
                          {renderSortIcon(sortDirection)}
                        </span>
                      );
                    }}
                  </Table.Column>
                ))}
                <Table.Column id="actions" className="border-r border-separator/60">
                  <span className="block text-center text-xs sm:text-sm">操作</span>
                </Table.Column>
              </Table.Header>
              <Table.Body>
                {stableTeachers.length === 0 ? (
                  <Table.Row id="empty">
                    <Table.Cell className="text-muted-foreground py-10 text-center" colSpan={columns.length + 1}>
                      データはありません
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  stableTeachers.map((teacher) => {
                    const teacherId = String(teacher.id);
                    return (
                      <Table.Row id={teacherId} key={teacherId}>
                        {columns.map((column, index) => (
                          <Table.Cell
                            key={`${teacherId}-${column.id}`}
                            className={[
                              "py-1.5",
                              "border-r border-separator/60",
                              index === 0 ? "border-l border-separator/60" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {column.renderCell(teacher)}
                          </Table.Cell>
                        ))}
                        <Table.Cell className="py-1.5 border-r border-separator/60">
                          <div className="flex justify-center gap-2">
                            <Button
                              className="border-transparent text-accent hover:bg-accent-soft"
                              isDisabled={isProcessing}
                              isIconOnly
                              size="sm"
                              variant="outline"
                              onPress={() => onEdit(teacherId)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              className="border-transparent text-danger hover:bg-danger-soft"
                              isDisabled={isProcessing}
                              isIconOnly
                              size="sm"
                              variant="outline"
                              onPress={() => onDelete(teacherId)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </TableLoadingShell>
    </div>
  );
}
