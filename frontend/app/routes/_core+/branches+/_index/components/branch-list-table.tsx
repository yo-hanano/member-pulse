import { Button, ListBox, Pagination, Select, Table } from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";
import type { Key } from "react";
import { useMemo } from "react";
import { TableLoadingShell } from "~/components/table/table-loading-shell";
import { getPageNumbers, renderSortIcon, toSortingState } from "~/components/table/table-utils";
import type { BranchListItemFragment } from "~/generated/graphql";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { branchQueryParsers, branchQueryUrlKeys } from "~/routes/_core+/branches+/_index/query-state";

const pageSizeOptions = [10, 20, 50, 100] as const;

type BranchColumn = {
  id: string;
  label: string;
  sortable: boolean;
  isRowHeader?: boolean;
  renderCell: (branch: BranchListItemFragment) => string;
};

export function BranchListTable({
  data,
  isProcessing,
  totalPages,
  totalCount,
  onEdit,
  onDelete,
}: {
  data: BranchListItemFragment[];
  isProcessing?: boolean;
  totalPages: number;
  totalCount?: number;
  onEdit: (branchId: string) => void;
  onDelete: (branchId: string) => void;
}) {
  const stableBranches = useMemo(() => data.filter((branch) => branch.id != null), [data]);

  const { page: pageNo, limit: limitNo, sortDescriptor, setPage, setSorting } = useTableSearchParams({
    parsers: branchQueryParsers,
    urlKeys: branchQueryUrlKeys,
  });

  const columns: BranchColumn[] = useMemo(
    () => [
      {
        id: "code",
        label: "拠点コード",
        sortable: true,
        renderCell: (branch) => branch.code ?? "-",
      },
      {
        id: "name",
        label: "拠点名",
        sortable: true,
        isRowHeader: true,
        renderCell: (branch) => branch.name ?? "-",
      },
      {
        id: "areaName",
        label: "エリア",
        sortable: false,
        renderCell: (branch) => branch.area?.name ?? "-",
      },
      {
        id: "zipCode",
        label: "郵便番号",
        sortable: false,
        renderCell: (branch) => branch.zipCode ?? "-",
      },
      {
        id: "prefectureName",
        label: "都道府県",
        sortable: false,
        renderCell: (branch) => branch.prefecture?.name ?? "-",
      },
      {
        id: "address",
        label: "住所",
        sortable: false,
        renderCell: (branch) => branch.address ?? "-",
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
              aria-label="branches table"
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
                {stableBranches.length === 0 ? (
                  <Table.Row id="empty">
                    <Table.Cell className="text-muted-foreground py-10 text-center" colSpan={7}>
                      データはありません
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  stableBranches.map((branch) => {
                    const branchId = String(branch.id);
                    return (
                      <Table.Row id={branchId} key={branchId}>
                        {columns.map((column, index) => (
                          <Table.Cell
                            key={`${branchId}-${column.id}`}
                            className={[
                              "py-1.5",
                              "border-r border-separator/60",
                              index === 0 ? "border-l border-separator/60" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {column.renderCell(branch)}
                          </Table.Cell>
                        ))}
                        <Table.Cell
                          className="py-1.5 border-r border-separator/60"
                        >
                          <div className="flex justify-center gap-2">
                            <Button
                              className="border-transparent text-foreground hover:bg-default-100"
                              isDisabled={isProcessing}
                              size="sm"
                              variant="outline"
                              onPress={() => window.location.assign(`/branches/${branchId}/opening-schedules`)}
                            >
                              開校
                            </Button>
                            <Button
                              className="border-transparent text-accent hover:bg-accent-soft"
                              isDisabled={isProcessing}
                              isIconOnly
                              size="sm"
                              variant="outline"
                              onPress={() => onEdit(branchId)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              className="border-transparent text-danger hover:bg-danger-soft"
                              isDisabled={isProcessing}
                              isIconOnly
                              size="sm"
                              variant="outline"
                              onPress={() => onDelete(branchId)}
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
