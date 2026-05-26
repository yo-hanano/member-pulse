import { Button, Chip, ListBox, Pagination, Select, Table } from "@heroui/react";
import { Link2, Pencil, Trash2 } from "lucide-react";
import type { Key, ReactNode } from "react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

import { TableLoadingShell } from "~/components/table/table-loading-shell";
import { getPageNumbers, renderSortIcon, toSortingState } from "~/components/table/table-utils";
import type { StudentListItemFragment } from "~/generated/graphql";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { formatDateYmd } from "~/lib/date";
import {
  studentQueryParsers,
  studentQueryUrlKeys,
} from "~/routes/_core+/students+/_index/query-state";
import { studentStatusLabel } from "~/routes/_core+/students+/_index/student-status";

const pageSizeOptions = [10, 20, 50, 100] as const;

type StudentColumn = {
  id: string;
  label: string;
  sortable: boolean;
  isRowHeader?: boolean;
  renderCell: (student: StudentListItemFragment) => ReactNode;
};

interface Props {
  data: StudentListItemFragment[];
  isProcessing?: boolean;
  totalPages: number;
  totalCount?: number;
  onEdit: (studentId: string) => void;
  onDelete: (studentId: string) => void;
}

// 生徒一覧テーブルを表示し、編集・削除アクションを提供する。
export function StudentListTable({
  data,
  isProcessing,
  totalPages,
  totalCount,
  onEdit,
  onDelete,
}: Props) {
  const stableStudents = useMemo(() => data.filter((student) => student.id != null), [data]);
  const navigate = useNavigate();

  const {
    page: pageNo,
    limit: limitNo,
    sortDescriptor,
    setPage,
    setSorting,
  } = useTableSearchParams({
    parsers: studentQueryParsers,
    urlKeys: studentQueryUrlKeys,
  });

  const columns: StudentColumn[] = useMemo(
    () => [
      {
        id: "code",
        label: "生徒NO",
        sortable: true,
        renderCell: (student) => student.code ?? "-",
      },
      {
        id: "name",
        label: "名前",
        sortable: true,
        isRowHeader: true,
        renderCell: (student) => student.name ?? "-",
      },
      {
        id: "kana",
        label: "フリガナ",
        sortable: true,
        renderCell: (student) => student.kana ?? "-",
      },
      {
        id: "birthday",
        label: "誕生日",
        sortable: true,
        renderCell: (student) => formatDateYmd(student.birthday),
      },
      {
        id: "branchLabels",
        label: "拠点",
        sortable: false,
        renderCell: (student) => {
          const labels = student.branchLabels ?? [];
          if (labels.length === 0) return "-";
          const hasMultipleBranches = labels.length > 1;
          return (
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {labels.map((label) => (
                <span
                  key={`${label?.name ?? "-"}-${label?.primary ? "primary" : "secondary"}`}
                  className="inline-flex items-center gap-1"
                >
                  {hasMultipleBranches && label?.primary ? (
                    <Chip aria-label="primary branch" size="sm" variant="primary">
                      ★
                    </Chip>
                  ) : null}
                  <span>{label?.name ?? "-"}</span>
                </span>
              ))}
            </div>
          );
        },
      },
      {
        id: "schoolName",
        label: "所属学校",
        sortable: true,
        renderCell: (student) => student.schoolName ?? "-",
      },
      {
        id: "schoolTypeName",
        label: "学校種",
        sortable: false,
        renderCell: (student) => student.schoolTypeName ?? "-",
      },
      {
        id: "schoolGradeCode",
        label: "学年",
        sortable: true,
        renderCell: (student) => student.schoolGradeName ?? "-",
      },
      {
        id: "status",
        label: "在籍状態",
        sortable: true,
        renderCell: (student) => (
          <Chip size="sm" variant="soft">
            {studentStatusLabel(student.status)}
          </Chip>
        ),
      },
    ],
    [],
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
              <Pagination.Item key={`ellipsis-${pageNumbers[idx - 1]}-${pageNumbers[idx + 1]}`}>
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
        <Table
          className={
            isProcessing
              ? "bg-surface opacity-70 transition-opacity"
              : "bg-surface transition-opacity"
          }
        >
          <Table.ScrollContainer>
            <Table.Content
              aria-label="students table"
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
                      if (!column.sortable)
                        return <span className="text-xs sm:text-sm">{column.label}</span>;
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
                {stableStudents.length === 0 ? (
                  <Table.Row id="empty">
                    <Table.Cell
                      className="text-muted-foreground py-10 text-center"
                      colSpan={columns.length + 1}
                    >
                      データはありません
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  stableStudents.map((student) => {
                    const studentId = String(student.id);
                    return (
                      <Table.Row id={studentId} key={studentId}>
                        {columns.map((column, index) => (
                          <Table.Cell
                            key={`${studentId}-${column.id}`}
                            className={[
                              "py-1.5",
                              "border-r border-separator/60",
                              index === 0 ? "border-l border-separator/60" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {column.renderCell(student)}
                          </Table.Cell>
                        ))}
                        <Table.Cell className="py-1.5 border-r border-separator/60">
                          <div className="flex justify-center gap-2">
                            <Button
                              className="border-transparent text-foreground hover:bg-default-100"
                              isDisabled={isProcessing}
                              isIconOnly
                              size="sm"
                              variant="outline"
                              onPress={() => navigate(`/students/${studentId}`)}
                            >
                              <Link2 className="size-4" />
                            </Button>
                            <Button
                              className="border-transparent text-accent hover:bg-accent-soft"
                              isDisabled={isProcessing}
                              isIconOnly
                              size="sm"
                              variant="outline"
                              onPress={() => onEdit(studentId)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              className="border-transparent text-danger hover:bg-danger-soft"
                              isDisabled={isProcessing}
                              isIconOnly
                              size="sm"
                              variant="outline"
                              onPress={() => onDelete(studentId)}
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
