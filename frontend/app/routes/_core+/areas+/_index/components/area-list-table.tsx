import {
  ActionIcon,
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
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { DragEvent } from "react";
import { useMemo, useState } from "react";

import { renderSortIcon } from "~/components/table/table-utils";
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

  const {
    page: pageNo,
    limit: limitNo,
    sorting,
    setPage,
    setSorting,
  } = useTableSearchParams({
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
    <Paper maw={960} pos="relative" radius="sm" shadow="xs" withBorder>
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
              <Table.Th w="52%">
                <UnstyledButton onClick={() => toggleSort("name")}>
                  <Group gap={6} wrap="nowrap">
                    <Text fw={700} size="sm">
                      エリア名
                    </Text>
                    {renderSortIcon(sortDirection("name"))}
                  </Group>
                </UnstyledButton>
              </Table.Th>
              <Table.Th w="20%">
                <UnstyledButton onClick={() => toggleSort("dispOrder")}>
                  <Group gap={6} wrap="nowrap">
                    <Text fw={700} size="sm">
                      表示順
                    </Text>
                    {renderSortIcon(sortDirection("dispOrder"))}
                  </Group>
                </UnstyledButton>
              </Table.Th>
              <Table.Th ta="center">操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {stableAreas.length === 0 ? (
              <Table.Tr>
                <Table.Td c="dimmed" colSpan={3} py="xl" ta="center">
                  データはありません
                </Table.Td>
              </Table.Tr>
            ) : (
              stableAreas.map((area) => {
                const areaId = String(area.id);
                const isDragging = draggingId != null && draggingId === areaId;
                const isDragOver = dragOverId != null && dragOverId === areaId;

                return (
                  <Table.Tr
                    key={areaId}
                    bg={isDragging || isDragOver ? "var(--mantine-color-gray-0)" : undefined}
                  >
                    <Table.Td>
                      <button
                        aria-label="並び替え"
                        className="inline-flex w-full items-center gap-2 border-0 bg-transparent p-0 text-left"
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
                          if (sourceId) reorderById(sourceId, areaId);
                          setDragOverId(null);
                        }}
                      >
                        <GripVertical size={16} />
                        <Text size="sm">{area.name ?? "-"}</Text>
                      </button>
                    </Table.Td>
                    <Table.Td>{String(area.dispOrder ?? "-")}</Table.Td>
                    <Table.Td>
                      <Group gap={6} justify="center" wrap="nowrap">
                        <Tooltip label="編集">
                          <ActionIcon color="blue" variant="subtle" onClick={() => onEdit(areaId)}>
                            <Pencil size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="削除">
                          <ActionIcon color="red" variant="subtle" onClick={() => onDelete(areaId)}>
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
