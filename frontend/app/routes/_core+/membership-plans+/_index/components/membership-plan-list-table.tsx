import { ActionIcon, Badge, Box, Group, Paper, Table, Text, Tooltip } from "@mantine/core";
import { Pencil, Trash2 } from "lucide-react";

import type { MembershipPlanItemFragment } from "~/generated/graphql";
import { useMasterLocations } from "~/hooks/useMasterData";

interface Props {
  plans: MembershipPlanItemFragment[];
  onEdit: (plan: MembershipPlanItemFragment) => void;
  onDelete: (planId: string) => void;
}

// 月額プラン一覧テーブル。マスタ管理なのでページングなしの全件表示。
export function MembershipPlanListTable({ plans, onEdit, onDelete }: Props) {
  const { data: locations = [] } = useMasterLocations();
  const locationNameById = new Map(
    locations.map((location) => [String(location.id), location.name ?? "-"] as const),
  );

  return (
    <Paper radius="sm" shadow="xs" withBorder>
      <Box className="overflow-x-auto">
        <Table highlightOnHover miw={760} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={80}>
                <Text fw={700} size="sm">
                  表示順
                </Text>
              </Table.Th>
              <Table.Th>
                <Text fw={700} size="sm">
                  プラン名
                </Text>
              </Table.Th>
              <Table.Th>
                <Text fw={700} size="sm">
                  月額
                </Text>
              </Table.Th>
              <Table.Th>
                <Text fw={700} size="sm">
                  拠点
                </Text>
              </Table.Th>
              <Table.Th>
                <Text fw={700} size="sm">
                  状態
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
            {plans.length === 0 ? (
              <Table.Tr>
                <Table.Td c="dimmed" colSpan={7} py="xl" ta="center">
                  プランはまだ登録されていません
                </Table.Td>
              </Table.Tr>
            ) : (
              plans.map((plan) => {
                const planId = String(plan.id);
                return (
                  <Table.Tr key={planId}>
                    <Table.Td>{plan.displayOrder ?? "-"}</Table.Td>
                    <Table.Td>
                      <Text fw={600} size="sm">
                        {plan.name ?? "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600} size="sm">
                        ¥{(plan.monthlyFee ?? 0).toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {plan.locationId
                        ? (locationNameById.get(plan.locationId) ?? plan.locationId)
                        : "全拠点共通"}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={plan.active ? "green" : "gray"} radius="sm" variant="light">
                        {plan.active ? "募集中" : "停止"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text c="dimmed" lineClamp={1} size="sm">
                        {plan.note ?? "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} justify="center" wrap="nowrap">
                        <Tooltip label="編集">
                          <ActionIcon color="blue" variant="subtle" onClick={() => onEdit(plan)}>
                            <Pencil size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="削除">
                          <ActionIcon color="red" variant="subtle" onClick={() => onDelete(planId)}>
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
    </Paper>
  );
}
