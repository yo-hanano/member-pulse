import { Button, Chip, ListBox, Pagination, Select, Table } from "@heroui/react";
import { CheckCircle2, Pencil, RotateCcw, Trash2, XCircle } from "lucide-react";
import type { Key, ReactNode } from "react";
import { useMemo } from "react";

import { TableLoadingShell } from "~/components/table/table-loading-shell";
import { getPageNumbers, renderSortIcon, toSortingState } from "~/components/table/table-utils";
import { formatDateTimeYmdHm, formatDateYmd } from "~/lib/date";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import {
  formatScheduleEventLeadLabel,
  formatScheduleEventType,
  formatScheduleEventStatus,
  scheduleEventTypeColor,
  scheduleEventStatusColor,
} from "~/routes/_core+/schedule-events+/_index/schedule-event-options";
import type { ScheduleEventRow } from "~/routes/_core+/schedule-events+/_index/schedule-event-row";
import { scheduleEventQueryParsers, scheduleEventQueryUrlKeys } from "~/routes/_core+/schedule-events+/_index/query-state";
import type { ScheduleEventOperationMode } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-operation-modal";

const pageSizeOptions = [10, 20, 50, 100] as const;

type ScheduleEventColumn = {
  id: string;
  label: string;
  sortable: boolean;
  isRowHeader?: boolean;
  renderCell: (scheduleEvent: ScheduleEventRow) => ReactNode;
};

interface Props {
  data: ScheduleEventRow[];
  isProcessing?: boolean;
  totalPages: number;
  totalCount?: number;
  showLeadColumn?: boolean;
  onEdit: (scheduleEventId: string) => void;
  onDelete: (scheduleEventId: string) => void;
  actionMode?: "manage" | "append";
  onOperate?: (scheduleEventId: string, mode: ScheduleEventOperationMode) => void;
}

// 訪問・来塾予定一覧テーブルを表示し、編集・削除アクションを提供する。
export function ScheduleEventListTable({
  data,
  isProcessing,
  totalPages,
  totalCount,
  showLeadColumn = true,
  onEdit,
  onDelete,
  actionMode = "manage",
  onOperate,
}: Props) {
  const stableScheduleEvents = useMemo(() => data.filter((scheduleEvent) => scheduleEvent.id != null), [data]);
  const latestOperableScheduleEventIds = useMemo(() => {
    const ids = new Set<string>();
    const seenLeadIds = new Set<string>();

    for (const scheduleEvent of stableScheduleEvents) {
      const scheduleEventId = scheduleEvent.id ? String(scheduleEvent.id) : null;
      const leadId = scheduleEvent.leadId ?? scheduleEvent.subject?.lead?.id ?? null;
      if (!scheduleEventId) continue;
      if (leadId == null) {
        ids.add(scheduleEventId);
        continue;
      }
      const leadKey = String(leadId);
      if (seenLeadIds.has(leadKey)) continue;
      seenLeadIds.add(leadKey);
      ids.add(scheduleEventId);
    }

    return ids;
  }, [stableScheduleEvents]);

  const { page: pageNo, limit: limitNo, sortDescriptor, setPage, setSorting } = useTableSearchParams({
    parsers: scheduleEventQueryParsers,
    urlKeys: scheduleEventQueryUrlKeys,
  });

  const columns: ScheduleEventColumn[] = useMemo(
    () => [
      {
        id: "leadId",
        label: "リード",
        sortable: true,
        isRowHeader: true,
        renderCell: (scheduleEvent) =>
          scheduleEvent.subject?.lead ? (
            <div className="space-y-0.5">
              <p className="font-medium">{formatScheduleEventLeadLabel(scheduleEvent.subject.lead)}</p>
              <p className="text-muted-foreground text-xs">{scheduleEvent.leadId}</p>
            </div>
          ) : (
            scheduleEvent.leadId ?? "-"
          ),
      },
      {
        id: "activityType",
        label: "予定種別",
        sortable: true,
        renderCell: (scheduleEvent) => (
          <Chip color={scheduleEventTypeColor(scheduleEvent.activityType)} size="sm" variant="soft">
            {formatScheduleEventType(scheduleEvent.activityType)}
          </Chip>
        ),
      },
      {
        id: "activityAt",
        label: "予定日時",
        sortable: true,
        renderCell: (scheduleEvent) => formatDateTimeYmdHm(scheduleEvent.activityAt),
      },
      {
        id: "status",
        label: "ステータス",
        sortable: true,
        renderCell: (scheduleEvent) => (
          <Chip color={scheduleEventStatusColor(scheduleEvent.status)} size="sm" variant="soft">
            {formatScheduleEventStatus(scheduleEvent.status)}
          </Chip>
        ),
      },
      {
        id: "reason",
        label: "理由・メモ",
        sortable: true,
        renderCell: (scheduleEvent) => scheduleEvent.reason ?? scheduleEvent.note ?? "-",
      },
      {
        id: "createdAt",
        label: "作成日",
        sortable: true,
        renderCell: (scheduleEvent) => formatDateYmd(scheduleEvent.createdAt),
      },
    ],
    [],
  );

  const pageNumbers = getPageNumbers(pageNo, totalPages);
  const start = (pageNo - 1) * limitNo + 1;
  const end = Math.min(pageNo * limitNo, totalCount ?? 0);
  const renderColumns = showLeadColumn ? columns : columns.filter((column) => column.id !== "leadId");
  const accessibleColumns =
    renderColumns.length > 0
      ? renderColumns.map((column, index) => (index === 0 && !column.isRowHeader ? { ...column, isRowHeader: true } : column))
      : renderColumns;

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

      <p className="text-muted-foreground text-xs">操作は、各リードの最新かつ予定中の行だけに表示します。</p>

      <TableLoadingShell isLoading={isProcessing}>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface">
          <Table.Root
            className={isProcessing ? "min-w-full bg-surface opacity-70 transition-opacity" : "min-w-full bg-surface transition-opacity"}
          >
            <Table.ScrollContainer>
              <Table.Content
                aria-label="schedule events table"
                sortDescriptor={sortDescriptor}
                onSortChange={(descriptor) => setSorting(toSortingState(descriptor))}
              >
                <Table.Header>
                  {accessibleColumns.map((column, index) => (
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
                  {stableScheduleEvents.length === 0 ? (
                    <Table.Row id="empty">
                      <Table.Cell className="text-muted-foreground py-10 text-center" colSpan={accessibleColumns.length + 1}>
                        データはありません
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    stableScheduleEvents.map((scheduleEvent) => {
                      const scheduleEventId = String(scheduleEvent.id);
                      const scheduleEventStatus = String(scheduleEvent.status ?? "").trim().toLowerCase();
                      const isOperableScheduleEvent = ["planned", "not_done"].includes(scheduleEventStatus);

                      return (
                        <Table.Row id={scheduleEventId} key={scheduleEventId}>
                          {accessibleColumns.map((column) => (
                            <Table.Cell key={`${scheduleEventId}-${column.id}`}>{column.renderCell(scheduleEvent)}</Table.Cell>
                          ))}
                          <Table.Cell className="text-center">
                            {latestOperableScheduleEventIds.has(scheduleEventId) ? (
                              actionMode === "append" ? (
                                <div className="inline-flex flex-wrap justify-center gap-1">
                                  {isOperableScheduleEvent ? (
                                    <>
                                      <Button size="sm" variant="outline" onPress={() => onOperate?.(scheduleEventId, "reschedule")}>
                                        <RotateCcw className="size-4" />
                                        日程変更
                                      </Button>
                                      <Button size="sm" variant="outline" onPress={() => onOperate?.(scheduleEventId, "cancel")}>
                                        <XCircle className="size-4" />
                                        キャンセル
                                      </Button>
                                      <Button size="sm" variant="outline" onPress={() => onOperate?.(scheduleEventId, "done")}>
                                        <CheckCircle2 className="size-4" />
                                        実施済み
                                      </Button>
                                    </>
                                  ) : (
                                    <Chip size="sm" variant="secondary">
                                      完了済み
                                    </Chip>
                                  )}
                                </div>
                              ) : isOperableScheduleEvent ? (
                                <div className="inline-flex items-center gap-1">
                                  <Button isIconOnly aria-label="編集" size="sm" variant="ghost" onPress={() => onEdit(scheduleEventId)}>
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button
                                    isIconOnly
                                    aria-label="削除"
                                    size="sm"
                                    variant="danger-soft"
                                    onPress={() => onDelete(scheduleEventId)}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Chip size="sm" variant="secondary">
                                  完了済み
                                </Chip>
                              )
                            ) : (
                              <Chip size="sm" variant="secondary">
                                履歴
                              </Chip>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table.Root>
        </div>
      </TableLoadingShell>
    </div>
  );
}
