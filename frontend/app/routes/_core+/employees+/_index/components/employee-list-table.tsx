import { AlertDialog, Button, Chip, ListBox, Pagination, Select, Table } from "@heroui/react";
import { Mail, Pencil, Trash2 } from "lucide-react";
import type { Key, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRevalidator } from "react-router";

import { TableLoadingShell } from "~/components/table/table-loading-shell";
import { getPageNumbers, renderSortIcon, toSortingState } from "~/components/table/table-utils";
import { EMPLOYEE_STATUS_LABELS } from "~/constants";
import type { EmployeeListItemFragment } from "~/generated/graphql";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { EmployeeEditModal } from "~/routes/_core+/employees+/_index/components/employee-edit-modal";
import { EmployeeInviteDialog } from "~/routes/_core+/employees+/_index/components/employee-invite-dialog";
import { employeeQueryParsers, employeeQueryUrlKeys } from "~/routes/_core+/employees+/_index/query-state";
import { useEmployeeDelete } from "~/routes/_core+/employees+/_index/hooks/useEmployeeDelete";
import { useEmployeeInvite } from "~/routes/_core+/employees+/_index/hooks/useEmployeeInvite";

const pageSizeOptions = [10, 20, 50, 100] as const;

type EmployeeColumn = {
  id: string;
  label: string;
  sortable: boolean;
  isRowHeader?: boolean;
  renderCell: (employee: EmployeeListItemFragment) => ReactNode;
};

const roleLabel = (isAdmin?: boolean | null) => (isAdmin ? "管理者" : "一般");
const statusLabel = (value?: string | null) => {
  if (!value) return "-";
  const key = value.toLowerCase() as keyof typeof EMPLOYEE_STATUS_LABELS;
  return EMPLOYEE_STATUS_LABELS[key] ?? value;
};
const statusColor = (value?: string | null): "success" | "warning" | "default" | "danger" => {
  const key = value?.toLowerCase();
  if (key === "active") return "success";
  if (key === "invited") return "warning";
  if (key === "suspended") return "danger";
  return "default";
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

  const { page: pageNo, limit: limitNo, sortDescriptor, setPage, setSorting } = useTableSearchParams({
    parsers: employeeQueryParsers,
    urlKeys: employeeQueryUrlKeys,
  });

  const columns: EmployeeColumn[] = useMemo(
    () => [
      { id: "name", label: "氏名", sortable: true, isRowHeader: true, renderCell: (employee) => employee.name ?? "-" },
      { id: "email", label: "メールアドレス", sortable: true, renderCell: (employee) => employee.email ?? "-" },
      { id: "isAdmin", label: "ロール", sortable: true, renderCell: (employee) => roleLabel(employee.isAdmin) },
      {
        id: "status",
        label: "状態",
        sortable: true,
        renderCell: (employee) => (
          <Chip color={statusColor(employee.status)} size="sm" variant="soft">
            {statusLabel(employee.status)}
          </Chip>
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

  const pageItems = getPageNumbers(pageNo, Math.max(totalPages, 1));
  const start = totalCount ? (pageNo - 1) * limitNo + 1 : 0;
  const end = Math.min(pageNo * limitNo, totalCount ?? 0);

  return (
    <>
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
                variant="secondary"
                value={String(limitNo)}
                onChange={(key: Key | Key[] | null) => setPage(1, Number(String(key ?? "10")))}
              >
                <Select.Trigger className="w-20">
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
              <Pagination.Previous isDisabled={pageNo <= 1} onPress={() => setPage(Math.max(1, pageNo - 1), limitNo)}>
                <Pagination.PreviousIcon />
              </Pagination.Previous>
            </Pagination.Item>
            {pageItems.map((p, idx) =>
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
              <Pagination.Next isDisabled={pageNo >= totalPages} onPress={() => setPage(Math.min(totalPages, pageNo + 1), limitNo)}>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>

        <TableLoadingShell isLoading={isProcessing}>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface">
            <Table.Root className={isProcessing ? "min-w-full bg-surface opacity-70 transition-opacity" : "min-w-full bg-surface transition-opacity"}>
              <Table.ScrollContainer>
                <Table.Content aria-label="employees table" sortDescriptor={sortDescriptor} onSortChange={(descriptor) => setSorting(toSortingState(descriptor))}>
                  <Table.Header>
                    {columns.map((column, index) => (
                      <Table.Column
                        key={column.id}
                        id={column.id}
                        allowsSorting={column.sortable}
                        className={[
                          "border-r border-separator/60",
                          index === 0 ? "min-w-[180px]" : "",
                          column.id === "email" ? "min-w-[240px]" : "",
                        ].join(" ")}
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
                    {stableEmployees.length === 0 ? (
                      <Table.Row id="empty">
                        <Table.Cell className="text-muted-foreground py-10 text-center" colSpan={5}>
                          データはありません
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      stableEmployees.map((employee) => {
                        const employeeId = String(employee.id);
                        return (
                          <Table.Row id={employeeId} key={employeeId}>
                            {columns.map((column, index) => (
                              <Table.Cell
                                key={`${employeeId}-${column.id}`}
                                className={[
                                  "py-1.5",
                                  "border-r border-separator/60",
                                  index === 0 ? "font-medium" : "",
                                ].join(" ")}
                              >
                                {column.renderCell(employee)}
                              </Table.Cell>
                            ))}
                            <Table.Cell className="py-1.5 border-r border-separator/60">
                              <div className="flex justify-center gap-2">
                                <Button className="border-transparent text-warning hover:bg-warning-soft" isDisabled={!employee.email} isIconOnly size="sm" variant="outline" onPress={() => employee.email && openInviteConfirm(employee.email)}>
                                  <Mail className="size-4" />
                                </Button>
                                <Button className="border-transparent text-accent hover:bg-accent-soft" isIconOnly size="sm" variant="outline" onPress={() => openEdit(employeeId)}>
                                  <Pencil className="size-4" />
                                </Button>
                                <Button className="border-transparent text-danger hover:bg-danger-soft" isIconOnly size="sm" variant="outline" onPress={() => openDeleteConfirm(employeeId)}>
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

      <EmployeeEditModal employeeId={editEmployeeId} isOpen={isEditOpen} onOpenChange={closeEdit} />

      <AlertDialog.Backdrop isOpen={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header className="flex flex-row items-center gap-3">
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>従業員を削除しますか？</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>この操作は元に戻せません。問題なければ削除を実行してください。</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
                キャンセル
              </Button>
              <Button className="app-primary-button" isPending={deleteMutation.submitting} onPress={handleDeleteConfirm}>
                削除する
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

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
