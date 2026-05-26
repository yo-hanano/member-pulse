import { Button, ListBox, Pagination, Select, Table } from "@heroui/react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { DragEvent, Key } from "react";
import { useMemo, useState } from "react";
import { TableLoadingShell } from "~/components/table/table-loading-shell";
import { getPageNumbers, renderSortIcon, toSortingState } from "~/components/table/table-utils";
import type { AreaListItemFragment } from "~/generated/graphql";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { areaQueryParsers, areaQueryUrlKeys } from "~/routes/_core+/areas+/_index/query-state";

const pageSizeOptions = [10, 20, 50, 100] as const;

const uiToApiOrderBy: Record<string, string> = {
  name: "name",
  dispOrder: "disp_order",
};

const apiToUiOrderBy: Record<string, string> = {
  name: "name",
  disp_order: "dispOrder",
};

export function AreaListTable({
  data,
  isProcessing,
  totalPages,
  totalCount,
  onEdit,
  onDelete,
  onReorder,
}: {
  data: AreaListItemFragment[];
  isProcessing?: boolean;
  totalPages: number;
  totalCount?: number;
  onEdit: (areaId: string) => void;
  onDelete: (areaId: string) => void;
  onReorder: (next: AreaListItemFragment[]) => void;
}) {
  const stableAreas = useMemo(() => data.filter((area) => area.id != null), [data]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const { page: pageNo, limit: limitNo, sortDescriptor, setPage, setSorting } = useTableSearchParams({
    parsers: areaQueryParsers,
    urlKeys: areaQueryUrlKeys,
    transforms: {
      fromQuery: (orderBy) => apiToUiOrderBy[orderBy] ?? orderBy,
      toQuery: (orderBy) => uiToApiOrderBy[orderBy] ?? orderBy,
    },
  });

  // ドラッグ元とドロップ先のIDから並び替え結果を作って親へ返す。
  const reorderById = (sourceId: string, targetId: string) => {
    const sourceIndex = stableAreas.findIndex((area) => String(area.id) === sourceId);
    const targetIndex = stableAreas.findIndex((area) => String(area.id) === targetId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;

    const next = [...stableAreas];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    onReorder(next);
  };

  const pageNumbers = getPageNumbers(pageNo, totalPages);
  const start = (pageNo - 1) * limitNo + 1;
  const end = Math.min(pageNo * limitNo, totalCount ?? 0);
  return (
    <div className="max-w-5xl space-y-2">
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
        <Table
          className={isProcessing ? "bg-surface opacity-70 transition-opacity" : "bg-surface transition-opacity"}
          style={{ tableLayout: "fixed" }}
        >
          <Table.ScrollContainer>
            <Table.Content
              aria-label="areas table"
              sortDescriptor={sortDescriptor}
              onSortChange={(descriptor) => setSorting(toSortingState(descriptor))}
            >
              <Table.Header>
                <Table.Column
                  id="name"
                  allowsSorting
                  className="w-[52%] cursor-pointer select-none border-r border-l border-separator/60"
                  isRowHeader
                >
                  {({ sortDirection }) => (
                    <span className="inline-flex items-center gap-1">
                      <span>エリア名</span>
                      {renderSortIcon(sortDirection)}
                    </span>
                  )}
                </Table.Column>
                <Table.Column
                  id="dispOrder"
                  allowsSorting
                  className="w-[20%] cursor-pointer select-none border-r border-separator/60"
                >
                  {({ sortDirection }) => (
                    <span className="inline-flex items-center gap-1">
                      <span>表示順</span>
                      {renderSortIcon(sortDirection)}
                    </span>
                  )}
                </Table.Column>
                <Table.Column id="actions" className="w-[28%] border-r border-separator/60">
                  <span className="block text-center">操作</span>
                </Table.Column>
              </Table.Header>
              <Table.Body>
                {stableAreas.length === 0 ? (
                  <Table.Row id="empty">
                    <Table.Cell className="text-muted-foreground py-10 text-center" colSpan={3}>
                      データはありません
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  stableAreas.map((area) => {
                    const areaId = String(area.id);
                    const isDragging = draggingId != null && draggingId === areaId;
                    const isDragOver = dragOverId != null && dragOverId === areaId;

                    return (
                      <Table.Row
                        id={areaId}
                        key={areaId}
                        className={[isDragging ? "bg-default/40" : "", isDragOver ? "ring-1 ring-border-tertiary" : ""]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <Table.Cell className="border-r border-l border-separator/60 select-none">
                          <button
                            aria-label="並び替え"
                            className="inline-flex w-full items-center gap-2 text-left text-foreground transition-colors hover:text-foreground/80"
                            draggable={!isProcessing}
                            style={{ cursor: !isProcessing ? "grab" : "default" }}
                            type="button"
                            onDragEnd={() => {
                              setDraggingId(null);
                              setDragOverId(null);
                            }}
                            onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                              setDraggingId(areaId);
                              setDragOverId(areaId);
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", areaId);
                            }}
                            onDragOver={(event: DragEvent<HTMLButtonElement>) => {
                              event.preventDefault();
                              setDragOverId(areaId);
                            }}
                            onDrop={(event: DragEvent<HTMLButtonElement>) => {
                              event.preventDefault();
                              const sourceId = draggingId || event.dataTransfer.getData("text/plain");
                              if (sourceId) {
                                reorderById(sourceId, areaId);
                              }
                              setDragOverId(null);
                            }}
                          >
                            <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                            <span>{area.name ?? "-"}</span>
                          </button>
                        </Table.Cell>
                        <Table.Cell className="border-r border-separator/60">{String(area.dispOrder ?? "-")}</Table.Cell>
                        <Table.Cell className="border-r border-separator/60">
                          <div className="flex justify-center gap-2">
                            <Button
                              className="border-transparent text-accent hover:bg-accent-soft"
                              isDisabled={isProcessing}
                              isIconOnly
                              size="sm"
                              variant="outline"
                              onPress={() => onEdit(areaId)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              className="border-transparent text-danger hover:bg-danger-soft"
                              isDisabled={isProcessing}
                              isIconOnly
                              size="sm"
                              variant="outline"
                              onPress={() => onDelete(areaId)}
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
