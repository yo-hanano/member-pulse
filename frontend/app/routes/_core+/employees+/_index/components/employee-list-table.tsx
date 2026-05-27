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
import { Mail, Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRevalidator } from "react-router";

import { renderSortIcon } from "~/components/table/table-utils";
import { EMPLOYEE_STATUS_LABELS } from "~/constants";
import type { EmployeeListItemFragment } from "~/generated/graphql";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { EmployeeDeleteDialog } from "~/routes/_core+/employees+/_index/components/employee-delete-dialog";
import { EmployeeEditModal } from "~/routes/_core+/employees+/_index/components/employee-edit-modal";
import { EmployeeInviteDialog } from "~/routes/_core+/employees+/_index/components/employee-invite-dialog";
import { useEmployeeDelete } from "~/routes/_core+/employees+/_index/hooks/useEmployeeDelete";
import { useEmployeeInvite } from "~/routes/_core+/employees+/_index/hooks/useEmployeeInvite";
import {
  employeeQueryParsers,
  employeeQueryUrlKeys,
} from "~/routes/_core+/employees+/_index/query-state";

const pageSizeOptions = [10, 20, 50, 100] as const;

type EmployeeColumn = {
  id: string;
  label: string;
  sortable: boolean;
  renderCell: (employee: EmployeeListItemFragment) => ReactNode;
};

const roleLabel = (isAdmin?: boolean | null) => (isAdmin ? "管理者" : "一般");
const statusLabel = (value?: string | null) => {
  if (!value) return "-";
  const key = value.toLowerCase() as keyof typeof EMPLOYEE_STATUS_LABELS;
  return EMPLOYEE_STATUS_LABELS[key] ?? value;
};
const statusColor = (value?: string | null) => {
  const key = value?.toLowerCase();
  if (key === "active") return "teal";
  if (key === "invited") return "yellow";
  if (key === "suspended") return "red";
  return "gray";
};

// 従業員一覧テーブルと一覧起点の操作状態を管理する。
export function EmployeeListTable({
  data,
  isProcessing,
  totalPages,
  totalCount,
}: {
  data: EmployeeListItemFragment[];
  isProcessing?: boolean;
  totalPages: number;
  totalCount?: number;
}) {
  const stableEmployees = useMemo(() => data.filter((employee) => employee.id != null), [data]);

  const {
    page: pageNo,
    limit: limitNo,
    sorting,
    setPage,
    setSorting,
  } = useTableSearchParams({
    parsers: employeeQueryParsers,
    urlKeys: employeeQueryUrlKeys,
  });

  const columns: EmployeeColumn[] = useMemo(
    () => [
      { id: "name", label: "氏名", sortable: true, renderCell: (employee) => employee.name ?? "-" },
      {
        id: "email",
        label: "メールアドレス",
        sortable: true,
        renderCell: (employee) => employee.email ?? "-",
      },
      {
        id: "isAdmin",
        label: "ロール",
        sortable: true,
        renderCell: (employee) => roleLabel(employee.isAdmin),
      },
      {
        id: "status",
        label: "状態",
        sortable: true,
        renderCell: (employee) => (
          <Badge color={statusColor(employee.status)} radius="sm" variant="light">
            {statusLabel(employee.status)}
          </Badge>
        ),
      },
    ],
    [],
  );

  const revalidator = useRevalidator();
  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openEdit = (employeeId: string) => {
    setEditEmployeeId(employeeId);
    setIsEditOpen(true);
  };

  const closeEdit = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) setEditEmployeeId(null);
  };

  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteMutation = useEmployeeDelete(() => {
    revalidator.revalidate();
    setIsDeleteDialogOpen(false);
    setDeleteEmployeeId(null);
  });

  const openDeleteConfirm = (employeeId: string) => {
    setDeleteEmployeeId(employeeId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteEmployeeId && !deleteMutation.submitting) {
      deleteMutation.submit(undefined, [{ employeeId: deleteEmployeeId }]);
    }
  };

  const closeDeleteDialog = (open: boolean) => {
    if (!deleteMutation.submitting) {
      setIsDeleteDialogOpen(open);
      if (!open) setDeleteEmployeeId(null);
    }
  };

  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const inviteMutation = useEmployeeInvite(() => {
    revalidator.revalidate();
    setIsInviteDialogOpen(false);
    setInviteEmail(null);
  });

  const openInviteConfirm = (email: string) => {
    setInviteEmail(email);
    setIsInviteDialogOpen(true);
  };

  const handleInviteConfirm = () => {
    if (inviteEmail && !inviteMutation.submitting) {
      inviteMutation.submit({ email: inviteEmail });
    }
  };

  const closeInviteDialog = (open: boolean) => {
    if (!inviteMutation.submitting) {
      setIsInviteDialogOpen(open);
      if (!open) setInviteEmail(null);
    }
  };

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
    <>
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
          <Table highlightOnHover miw={720} verticalSpacing="sm">
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
                      column.label
                    )}
                  </Table.Th>
                ))}
                <Table.Th ta="center">操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {stableEmployees.length === 0 ? (
                <Table.Tr>
                  <Table.Td c="dimmed" colSpan={5} py="xl" ta="center">
                    データはありません
                  </Table.Td>
                </Table.Tr>
              ) : (
                stableEmployees.map((employee) => {
                  const employeeId = String(employee.id);
                  return (
                    <Table.Tr key={employeeId}>
                      {columns.map((column) => (
                        <Table.Td key={`${employeeId}-${column.id}`}>
                          {column.renderCell(employee)}
                        </Table.Td>
                      ))}
                      <Table.Td>
                        <Group gap={6} justify="center" wrap="nowrap">
                          <Tooltip label="招待メールを再送">
                            <ActionIcon
                              color="yellow"
                              disabled={!employee.email}
                              variant="subtle"
                              onClick={() => employee.email && openInviteConfirm(employee.email)}
                            >
                              <Mail size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="編集">
                            <ActionIcon
                              color="blue"
                              variant="subtle"
                              onClick={() => openEdit(employeeId)}
                            >
                              <Pencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="削除">
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => openDeleteConfirm(employeeId)}
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

        <Group justify="flex-end" p="md">
          <Pagination
            total={safeTotalPages}
            value={Math.min(pageNo, safeTotalPages)}
            onChange={(page) => setPage(page, limitNo)}
          />
        </Group>
      </Paper>

      <EmployeeEditModal employeeId={editEmployeeId} isOpen={isEditOpen} onOpenChange={closeEdit} />

      <EmployeeDeleteDialog
        isOpen={isDeleteDialogOpen}
        isPending={deleteMutation.submitting}
        onConfirm={handleDeleteConfirm}
        onOpenChange={closeDeleteDialog}
      />

      <EmployeeInviteDialog
        email={inviteEmail}
        isOpen={isInviteDialogOpen}
        isPending={inviteMutation.submitting}
        onConfirm={handleInviteConfirm}
        onOpenChange={closeInviteDialog}
      />
    </>
  );
}
