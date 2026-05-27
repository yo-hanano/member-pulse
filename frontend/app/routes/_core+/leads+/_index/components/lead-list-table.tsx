import {
  ActionIcon,
  Badge,
  Box,
  Group,
  LoadingOverlay,
  Pagination,
  Paper,
  Select,
  Table,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { Link2, Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router";

import { renderSortIcon } from "~/components/table/table-utils";
import type { LeadListItemFragment } from "~/generated/graphql";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { formatDateTimeYmdHm } from "~/lib/date";
import { formatLeadStatus, leadStatusBadgeColor } from "~/routes/_core+/leads+/_index/lead-status";
import { leadQueryParsers, leadQueryUrlKeys } from "~/routes/_core+/leads+/_index/query-state";

const pageSizeOptions = [10, 20, 50, 100] as const;

type LeadColumn = {
  id: string;
  label: string;
  sortable: boolean;
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
export function LeadListTable({
  data,
  isProcessing,
  totalPages,
  totalCount,
  onEdit,
  onDelete,
}: Props) {
  const stableLeads = useMemo(() => data.filter((lead) => lead.id != null), [data]);
  const navigate = useNavigate();

  const {
    page: pageNo,
    limit: limitNo,
    sorting,
    setPage,
    setSorting,
  } = useTableSearchParams({
    parsers: leadQueryParsers,
    urlKeys: leadQueryUrlKeys,
  });

  const columns: LeadColumn[] = useMemo(
    () => [
      {
        id: "inquiry_at",
        label: "問合せ日",
        sortable: true,
        renderCell: (lead) => formatDateTimeYmdHm(lead.inquiryAt),
      },
      {
        id: "location",
        label: "拠点",
        sortable: false,
        renderCell: (lead) => lead.location?.name ?? "-",
      },
      {
        id: "name",
        label: "氏名",
        sortable: true,
        renderCell: (lead) =>
          lead.id ? (
            <Text component={Link} fw={600} size="sm" to={`/leads/${lead.id}`}>
              {lead.name ?? "-"}
            </Text>
          ) : (
            (lead.name ?? "-")
          ),
      },
      {
        id: "source",
        label: "流入元",
        sortable: true,
        renderCell: (lead) => lead.source ?? "-",
      },
      {
        id: "status",
        label: "状態",
        sortable: true,
        renderCell: (lead) => (
          <Badge color={leadStatusBadgeColor(lead.status)} radius="sm" variant="light">
            {formatLeadStatus(lead.status)}
          </Badge>
        ),
      },
      {
        id: "phone",
        label: "電話番号",
        sortable: true,
        renderCell: (lead) => lead.phone ?? "-",
      },
      {
        id: "email",
        label: "メール",
        sortable: true,
        renderCell: (lead) => lead.email ?? "-",
      },
    ],
    [],
  );

  const start = totalCount ? (pageNo - 1) * limitNo + 1 : 0;
  const end = Math.min(pageNo * limitNo, totalCount ?? 0);
  const safeTotalPages = Math.max(totalPages, 1);

  const toggleSort = (columnId: string) => {
    const current = sorting[0];
    if (!current || current.id !== columnId) {
      setSorting([{ id: columnId, desc: false }]);
      return;
    }
    if (!current.desc) {
      setSorting([{ id: columnId, desc: true }]);
      return;
    }
    setSorting([]);
  };

  const sortDirection = (columnId: string) => {
    const current = sorting[0];
    if (!current || current.id !== columnId) return undefined;
    return current.desc ? "descending" : "ascending";
  };

  return (
    <Paper pos="relative" radius="sm" shadow="xs" withBorder>
      <LoadingOverlay visible={Boolean(isProcessing)} />
      <Group justify="space-between" p="md">
        <Text fw={600} size="sm">
          {(totalCount ?? 0) === 0 ? "0件" : `${start} - ${end} / ${totalCount ?? 0}件`}
        </Text>
        <Select
          aria-label="1ページあたりの表示件数"
          data={pageSizeOptions.map((size) => ({ value: String(size), label: `${size}件` }))}
          value={String(limitNo)}
          w={96}
          onChange={(value) => setPage(1, Number(value ?? 10))}
        />
      </Group>

      <Box className="overflow-x-auto">
        <Table highlightOnHover miw={980} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={column.id}>
                  {column.sortable ? (
                    <UnstyledButton onClick={() => toggleSort(column.id)}>
                      <Group gap={6} wrap="nowrap">
                        <Text fw={700} size="sm">
                          {column.label}
                        </Text>
                        {renderSortIcon(sortDirection(column.id))}
                      </Group>
                    </UnstyledButton>
                  ) : (
                    <Text fw={700} size="sm">
                      {column.label}
                    </Text>
                  )}
                </Table.Th>
              ))}
              <Table.Th ta="center">操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {stableLeads.length === 0 ? (
              <Table.Tr>
                <Table.Td c="dimmed" colSpan={columns.length + 1} py="xl" ta="center">
                  データはありません
                </Table.Td>
              </Table.Tr>
            ) : (
              stableLeads.map((lead) => {
                const leadId = String(lead.id);
                return (
                  <Table.Tr key={leadId}>
                    {columns.map((column) => (
                      <Table.Td key={`${leadId}-${column.id}`}>{column.renderCell(lead)}</Table.Td>
                    ))}
                    <Table.Td>
                      <Group gap={6} justify="center" wrap="nowrap">
                        <Tooltip label="詳細">
                          <ActionIcon variant="subtle" onClick={() => navigate(`/leads/${leadId}`)}>
                            <Link2 size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="編集">
                          <ActionIcon color="blue" variant="subtle" onClick={() => onEdit(leadId)}>
                            <Pencil size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="削除">
                          <ActionIcon color="red" variant="subtle" onClick={() => onDelete(leadId)}>
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Box>

      <Group justify="flex-end" p="md">
        <Pagination
          total={safeTotalPages}
          value={Math.min(pageNo, safeTotalPages)}
          onChange={(page) => setPage(page, limitNo)}
        />
      </Group>
    </Paper>
  );
}
