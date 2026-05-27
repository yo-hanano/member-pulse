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
import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRevalidator } from "react-router";

import { renderSortIcon } from "~/components/table/table-utils";
import type { LocationListItemFragment } from "~/generated/graphql";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { LocationDeleteDialog } from "~/routes/_core+/locations+/_index/components/location-delete-dialog";
import { LocationEditModal } from "~/routes/_core+/locations+/_index/components/location-edit-modal";
import { useLocationDelete } from "~/routes/_core+/locations+/_index/hooks/useLocationDelete";
import {
  locationQueryParsers,
  locationQueryUrlKeys,
} from "~/routes/_core+/locations+/_index/query-state";

const pageSizeOptions = [10, 20, 50, 100] as const;

type LocationColumn = {
  id: string;
  label: string;
  sortable: boolean;
  renderCell: (location: LocationListItemFragment) => ReactNode;
};

const compactAddress = (location: LocationListItemFragment) => {
  const parts = [location.prefecture?.name, location.address].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "-";
};

// 拠点一覧テーブルと一覧起点の操作状態を管理する。
export function LocationListTable({
  data,
  isProcessing,
  totalPages,
  totalCount,
}: {
  data: LocationListItemFragment[];
  isProcessing?: boolean;
  totalPages: number;
  totalCount?: number;
}) {
  const stableLocations = useMemo(() => data.filter((location) => location.id != null), [data]);

  const {
    page: pageNo,
    limit: limitNo,
    sorting,
    setPage,
    setSorting,
  } = useTableSearchParams({
    parsers: locationQueryParsers,
    urlKeys: locationQueryUrlKeys,
  });

  const columns: LocationColumn[] = useMemo(
    () => [
      {
        id: "name",
        label: "拠点名",
        sortable: true,
        renderCell: (location) => (
          <Group gap="xs" wrap="nowrap">
            <Text fw={600} size="sm">
              {location.name ?? "-"}
            </Text>
            {location.isDefault ? (
              <Badge color="teal" radius="sm" variant="light">
                既定
              </Badge>
            ) : null}
          </Group>
        ),
      },
      {
        id: "areaId",
        label: "エリア",
        sortable: true,
        renderCell: (location) => location.area?.name ?? "-",
      },
      {
        id: "prefectureCode",
        label: "所在地",
        sortable: true,
        renderCell: compactAddress,
      },
      {
        id: "zipCode",
        label: "郵便番号",
        sortable: true,
        renderCell: (location) => location.zipCode ?? "-",
      },
    ],
    [],
  );

  const revalidator = useRevalidator();
  const [editLocationId, setEditLocationId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openEdit = (locationId: string) => {
    setEditLocationId(locationId);
    setIsEditOpen(true);
  };

  const closeEdit = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) setEditLocationId(null);
  };

  const [deleteLocationId, setDeleteLocationId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteMutation = useLocationDelete(() => {
    revalidator.revalidate();
    setIsDeleteDialogOpen(false);
    setDeleteLocationId(null);
  });

  const openDeleteConfirm = (locationId: string) => {
    setDeleteLocationId(locationId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteLocationId && !deleteMutation.submitting) {
      deleteMutation.submit(undefined, [{ locationId: deleteLocationId }]);
    }
  };

  const closeDeleteDialog = (open: boolean) => {
    if (!deleteMutation.submitting) {
      setIsDeleteDialogOpen(open);
      if (!open) setDeleteLocationId(null);
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
          <Table highlightOnHover miw={760} verticalSpacing="sm">
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
              {stableLocations.length === 0 ? (
                <Table.Tr>
                  <Table.Td c="dimmed" colSpan={columns.length + 1} py="xl" ta="center">
                    データはありません
                  </Table.Td>
                </Table.Tr>
              ) : (
                stableLocations.map((location) => {
                  const locationId = String(location.id);
                  return (
                    <Table.Tr key={locationId}>
                      {columns.map((column) => (
                        <Table.Td key={`${locationId}-${column.id}`}>
                          {column.renderCell(location)}
                        </Table.Td>
                      ))}
                      <Table.Td>
                        <Group gap={6} justify="center" wrap="nowrap">
                          <Tooltip label="編集">
                            <ActionIcon
                              color="blue"
                              variant="subtle"
                              onClick={() => openEdit(locationId)}
                            >
                              <Pencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={location.isDefault ? "既定拠点は削除できません" : "削除"}>
                            <ActionIcon
                              color="red"
                              disabled={Boolean(location.isDefault)}
                              variant="subtle"
                              onClick={() => openDeleteConfirm(locationId)}
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

      <LocationEditModal isOpen={isEditOpen} locationId={editLocationId} onOpenChange={closeEdit} />

      <LocationDeleteDialog
        isOpen={isDeleteDialogOpen}
        isPending={deleteMutation.submitting}
        onConfirm={handleDeleteConfirm}
        onOpenChange={closeDeleteDialog}
      />
    </>
  );
}
