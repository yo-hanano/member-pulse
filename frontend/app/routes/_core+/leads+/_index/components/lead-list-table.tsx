import { Button, Chip, ListBox, Pagination, Select, Table } from "@heroui/react";
import { Link2, Pencil, Trash2 } from "lucide-react";
import type { Key, ReactNode } from "react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router";

import { TableLoadingShell } from "~/components/table/table-loading-shell";
import { getPageNumbers, renderSortIcon, toSortingState } from "~/components/table/table-utils";
import { formatDateTimeYmdHm } from "~/lib/date";
import type { LeadListItemFragment } from "~/generated/graphql";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { formatLeadStatus, leadStatusColor } from "~/routes/_core+/leads+/_index/lead-status";
import { leadQueryParsers, leadQueryUrlKeys } from "~/routes/_core+/leads+/_index/query-state";

const pageSizeOptions = [10, 20, 50, 100] as const;

type LeadColumn = {
  id: string;
  label: string;
  sortable: boolean;
  isRowHeader?: boolean;
  renderCell: (lead: LeadListItemFragment) => ReactNode;
};

interface Props {
  data: LeadListItemFragment[];
  isProcessing?: boolean;
  totalPages: number;
  totalCount?: number;
  onEdit: (leadId: string) => void;
  onDelete: (leadId: string) => void;
}

// リード一覧テーブルを表示し、編集・削除アクションを提供する。
export function LeadListTable({ data, isProcessing, totalPages, totalCount, onEdit, onDelete }: Props) {
  const stableLeads = useMemo(() => data.filter((lead) => lead.id != null), [data]);
  const navigate = useNavigate();

  const { page: pageNo, limit: limitNo, sortDescriptor, setPage, setSorting } = useTableSearchParams({
    parsers: leadQueryParsers,
    urlKeys: leadQueryUrlKeys,
  });

  const columns: LeadColumn[] = useMemo(
    () => [
      {
        id: "inquiryAt",
        label: "問合せ日",
        sortable: true,
        isRowHeader: true,
        renderCell: (lead) => formatDateTimeYmdHm(lead.inquiryAt),
      },
      {
        id: "branch",
        label: "拠点",
        sortable: false,
        renderCell: (lead) => lead.branch?.name ?? lead.branch?.code ?? "-",
      },
      {
        id: "studentName",
        label: "生徒名",
        sortable: true,
        renderCell: (lead) =>
          lead.id ? (
            <Link className="font-medium text-foreground hover:text-primary transition-colors" to={`/leads/${lead.id}`}>
              {lead.studentName ?? "-"}
            </Link>
          ) : (
            lead.studentName ?? "-"
          ),
      },
      {
        id: "guardianName",
        label: "保護者名",
        sortable: true,
        renderCell: (lead) => lead.guardianName ?? "-",
      },
      {
        id: "schoolName",
        label: "学校名",
        sortable: true,
        renderCell: (lead) => lead.schoolName ?? "-",
      },
      {
        id: "gradeName",
        label: "学年名",
        sortable: true,
        renderCell: (lead) => lead.gradeName ?? "-",
      },
      {
        id: "channel",
        label: "流入経路",
        sortable: true,
        renderCell: (lead) => lead.channel ?? "-",
      },
      {
        id: "status",
        label: "状態",
        sortable: true,
        renderCell: (lead) => (
          <Chip color={leadStatusColor(lead.status)} size="sm" variant="soft">
            {formatLeadStatus(lead.status)}
          </Chip>
        ),
      },
      {
        id: "phone",
        label: "電話番号",
        sortable: true,
        renderCell: (lead) => lead.phone ?? "-",
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
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface">
          <Table.Root className={isProcessing ? "min-w-full bg-surface opacity-70 transition-opacity" : "min-w-full bg-surface transition-opacity"}>
            <Table.ScrollContainer>
              <Table.Content
                aria-label="leads table"
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
                  {stableLeads.length === 0 ? (
                    <Table.Row id="empty">
                      <Table.Cell className="text-muted-foreground py-10 text-center" colSpan={columns.length + 1}>
                        データはありません
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    stableLeads.map((lead) => {
                      const leadId = String(lead.id);
                      return (
                        <Table.Row id={leadId} key={leadId}>
                          {columns.map((column, index) => (
                            <Table.Cell
                              key={`${leadId}-${column.id}`}
                              className={[
                                "py-1.5",
                                "border-r border-separator/60",
                                index === 0 ? "font-medium" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {column.renderCell(lead)}
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
                                onPress={() => navigate(`/leads/${leadId}`)}
                              >
                                <Link2 className="size-4" />
                              </Button>
                              <Button
                                className="border-transparent text-accent hover:bg-accent-soft"
                                isDisabled={isProcessing}
                                isIconOnly
                                size="sm"
                                variant="outline"
                                onPress={() => onEdit(leadId)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                className="border-transparent text-danger hover:bg-danger-soft"
                                isDisabled={isProcessing}
                                isIconOnly
                                size="sm"
                                variant="outline"
                                onPress={() => onDelete(leadId)}
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
          </Table.Root>
        </div>
      </TableLoadingShell>
    </div>
  );
}
