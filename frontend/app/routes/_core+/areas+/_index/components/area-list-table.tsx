import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { useMemo } from "react";

import { renderSortIcon } from "~/components/table/table-utils";
import type { AreaListItemFragment } from "~/generated/graphql";
import { useTableSearchParams } from "~/hooks/useTableSearchParams";
import { areaQueryParsers, areaQueryUrlKeys } from "~/routes/_core+/areas+/_index/query-state";

const pageSizeOptions = [10, 20, 50, 100] as const;

const uiToApiOrderBy: Record<string, string> = {
  name: "name",
  dispOrder: "display_order",
};

const apiToUiOrderBy: Record<string, string> = {
  name: "name",
  disp_order: "dispOrder",
};

type SortableAreaRowProps = {
  area: AreaListItemFragment;
  disabled?: boolean;
  onEdit: (areaId: string) => void;
  onDelete: (areaId: string) => void;
};

function SortableAreaRow({ area, disabled, onEdit, onDelete }: SortableAreaRowProps) {
  const areaId = String(area.id);
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: areaId, disabled });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.65 : 1,
    position: "relative",
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Table.Tr
      ref={setNodeRef}
      bg={isDragging ? "var(--mantine-color-gray-0)" : undefined}
      style={style}
    >
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="ドラッグして並び替え">
            <ActionIcon
              ref={setActivatorNodeRef}
              aria-label="並び替え"
              color="gray"
              disabled={disabled}
              size="sm"
              style={{ cursor: disabled ? "default" : "grab", touchAction: "none" }}
              variant="subtle"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={16} />
            </ActionIcon>
          </Tooltip>
          <Text size="sm">{area.name ?? "-"}</Text>
        </Group>
      </Table.Td>
      <Table.Td>{String(area.dispOrder ?? "-")}</Table.Td>
      <Table.Td>
        <Group gap={6} justify="center" wrap="nowrap">
          <Tooltip label="編集">
            <ActionIcon
              color="blue"
              disabled={disabled}
              variant="subtle"
              onClick={() => onEdit(areaId)}
            >
              <Pencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="削除">
            <ActionIcon
              color="red"
              disabled={disabled}
              variant="subtle"
              onClick={() => onDelete(areaId)}
            >
              <Trash2 size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

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
  const sortableIds = useMemo(() => stableAreas.map((area) => String(area.id)), [stableAreas]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  // dnd-kit の終了イベントから配列を並び替え、保存前のローカル状態へ反映する。
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = stableAreas.findIndex((area) => String(area.id) === active.id);
    const newIndex = stableAreas.findIndex((area) => String(area.id) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(arrayMove(stableAreas, oldIndex, newIndex));
  };

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
    <Paper maw={960} pos="relative" radius="sm" shadow="xs" withBorder>
      <LoadingOverlay visible={Boolean(isProcessing)} />
      {paginationControls}

      <Box className="overflow-x-auto">
        <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
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
                  stableAreas.map((area) => (
                    <SortableAreaRow
                      area={area}
                      disabled={isProcessing}
                      key={String(area.id)}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  ))
                )}
              </Table.Tbody>
            </Table>
          </SortableContext>
        </DndContext>
      </Box>

      {paginationControls}
    </Paper>
  );
}
