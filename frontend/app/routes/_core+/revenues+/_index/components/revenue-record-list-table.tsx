import { ActionIcon, Badge, Box, Group, Paper, Table, Text, Tooltip } from "@mantine/core";
import { Pencil, Trash2 } from "lucide-react";

import type { RevenueRecordItemFragment } from "~/generated/graphql";
import { formatDateYmd } from "~/lib/date";
import {
  formatRevenueSourceType,
  formatRevenueType,
  revenueTypeBadgeColor,
} from "~/routes/_core+/revenues+/_index/revenue-type";

interface Props {
  records: RevenueRecordItemFragment[];
  onEdit: (record: RevenueRecordItemFragment) => void;
  onDelete: (recordId: string) => void;
}

// 売上明細テーブル。対象月で絞った台帳をページングなしで表示する。
export function RevenueRecordListTable({ records, onEdit, onDelete }: Props) {
  return (
    <Paper radius="sm" shadow="xs" withBorder>
      <Box className="overflow-x-auto">
        <Table highlightOnHover miw={860} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={120}>
                <Text fw={700} size="sm">
                  売上日
                </Text>
              </Table.Th>
              <Table.Th w={100}>
                <Text fw={700} size="sm">
                  種別
                </Text>
              </Table.Th>
              <Table.Th>
                <Text fw={700} size="sm">
                  拠点
                </Text>
              </Table.Th>
              <Table.Th>
                <Text fw={700} size="sm">
                  会員
                </Text>
              </Table.Th>
              <Table.Th ta="right" w={130}>
                <Text fw={700} size="sm">
                  金額
                </Text>
              </Table.Th>
              <Table.Th w={90}>
                <Text fw={700} size="sm">
                  入力元
                </Text>
              </Table.Th>
              <Table.Th>
                <Text fw={700} size="sm">
                  メモ
                </Text>
              </Table.Th>
              <Table.Th ta="center" w={100}>
                操作
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {records.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text c="dimmed" py="md" size="sm" ta="center">
                    対象月の売上はまだありません。「月謝を生成」または「売上を追加」から登録できます。
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              records.map((record) => (
                <Table.Tr key={record.id}>
                  <Table.Td>
                    <Text size="sm">{formatDateYmd(record.revenueDate)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={revenueTypeBadgeColor(record.revenueType)}
                      radius="sm"
                      variant="light"
                    >
                      {formatRevenueType(record.revenueType)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{record.location?.name ?? "-"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{record.member?.name ?? "-"}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text fw={600} size="sm">
                      {record.amount != null ? `¥${record.amount.toLocaleString()}` : "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {/* 自動生成された月謝は手入力と見分けが付くようにする。 */}
                    <Badge
                      color={record.sourceType === "auto" ? "teal" : "gray"}
                      radius="sm"
                      variant="outline"
                    >
                      {formatRevenueSourceType(record.sourceType)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text c="dimmed" lineClamp={1} size="sm">
                      {record.note ?? "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="center" wrap="nowrap">
                      <Tooltip label="編集">
                        <ActionIcon
                          aria-label="売上を編集"
                          variant="subtle"
                          onClick={() => onEdit(record)}
                        >
                          <Pencil size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="削除">
                        <ActionIcon
                          aria-label="売上を削除"
                          color="red"
                          variant="subtle"
                          onClick={() => record.id && onDelete(record.id)}
                        >
                          <Trash2 size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Box>
    </Paper>
  );
}
