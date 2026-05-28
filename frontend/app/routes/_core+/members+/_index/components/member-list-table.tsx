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
import type { MemberListItemFragment } from "~/generated/graphql";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { formatDateYmd } from "~/lib/date";
import {
  formatMemberStatus,
  memberStatusBadgeColor,
} from "~/routes/_core+/members+/_index/member-status";
import {
  memberQueryParsers,
  memberQueryUrlKeys,
} from "~/routes/_core+/members+/_index/query-state";

const pageSizeOptions = [10, 20, 50, 100] as const;

type MemberColumn = {
  id: string;
  label: string;
  sortable: boolean;
  renderCell: (member: MemberListItemFragment) => ReactNode;
};

interface Props {
  data: MemberListItemFragment[];
  isProcessing?: boolean;
  totalPages: number;
  totalCount?: number;
  onEdit: (memberId: string) => void;
  onDelete: (memberId: string) => void;
}

// 会員一覧テーブルを表示し、編集・削除アクションを提供する。
export function MemberListTable({
  data,
  isProcessing,
  totalPages,
  totalCount,
  onEdit,
  onDelete,
}: Props) {
  const stableMembers = useMemo(() => data.filter((member) => member.id != null), [data]);
  const navigate = useNavigate();

  const {
    page: pageNo,
    limit: limitNo,
    sorting,
    setPage,
    setSorting,
  } = useTableSearchParams({
    parsers: memberQueryParsers,
    urlKeys: memberQueryUrlKeys,
  });

  const columns: MemberColumn[] = useMemo(
    () => [
      {
        id: "joined_at",
        label: "入会日",
        sortable: true,
        renderCell: (member) => formatDateYmd(member.joinedAt),
      },
      {
        id: "location",
        label: "拠点",
        sortable: false,
        renderCell: (member) => member.location?.name ?? "-",
      },
      {
        id: "name",
        label: "氏名",
        sortable: true,
        renderCell: (member) =>
          member.id ? (
            <Text component={Link} fw={600} size="sm" to={`/members/${member.id}`}>
              {member.name ?? "-"}
            </Text>
          ) : (
            (member.name ?? "-")
          ),
      },
      {
        id: "status",
        label: "状態",
        sortable: true,
        renderCell: (member) => (
          <Badge color={memberStatusBadgeColor(member.status)} radius="sm" variant="light">
            {formatMemberStatus(member.status)}
          </Badge>
        ),
      },
      {
        id: "source",
        label: "流入元",
        sortable: true,
        renderCell: (member) => member.source ?? "-",
      },
      {
        id: "phone",
        label: "電話番号",
        sortable: true,
        renderCell: (member) => member.phone ?? "-",
      },
      {
        id: "email",
        label: "メール",
        sortable: true,
        renderCell: (member) => member.email ?? "-",
      },
      {
        id: "resigned_at",
        label: "退会日",
        sortable: true,
        renderCell: (member) => formatDateYmd(member.resignedAt),
      },
    ],
    [],
  );

  const start = totalCount ? (pageNo - 1) * limitNo + 1 : 0;
  const end = Math.min(pageNo * limitNo, totalCount ?? 0);
  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(pageNo, safeTotalPages);
  const paginationControls = (
    <Group justify="space-between" p="md">
      <Text fw={600} size="sm">
        {(totalCount ?? 0) === 0 ? "0件" : `${start} - ${end} / ${totalCount ?? 0}件`}
      </Text>
      <Group gap="sm" justify="flex-end">
        <Select
          aria-label="1ページあたりの表示件数"
          data={pageSizeOptions.map((size) => ({
            value: String(size),
            label: `${String(size)}件`,
          }))}
          value={String(limitNo)}
          w={96}
          onChange={(value) => setPage(1, Number(value ?? 10))}
        />
        <Pagination
          total={safeTotalPages}
          value={currentPage}
          onChange={(page) => setPage(page, limitNo)}
        />
      </Group>
    </Group>
  );

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
      {paginationControls}

      <Box className="overflow-x-auto">
        <Table highlightOnHover miw={1080} verticalSpacing="sm">
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
            {stableMembers.length === 0 ? (
              <Table.Tr>
                <Table.Td c="dimmed" colSpan={columns.length + 1} py="xl" ta="center">
                  データはありません
                </Table.Td>
              </Table.Tr>
            ) : (
              stableMembers.map((member) => {
                const memberId = String(member.id);
                return (
                  <Table.Tr key={memberId}>
                    {columns.map((column) => (
                      <Table.Td key={`${memberId}-${column.id}`}>
                        {column.renderCell(member)}
                      </Table.Td>
                    ))}
                    <Table.Td>
                      <Group gap={6} justify="center" wrap="nowrap">
                        <Tooltip label="詳細">
                          <ActionIcon
                            variant="subtle"
                            onClick={() => navigate(`/members/${memberId}`)}
                          >
                            <Link2 size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="編集">
                          <ActionIcon
                            color="blue"
                            variant="subtle"
                            onClick={() => onEdit(memberId)}
                          >
                            <Pencil size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="削除">
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => onDelete(memberId)}
                          >
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

      {paginationControls}
    </Paper>
  );
}
