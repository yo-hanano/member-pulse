import { Button, Group, Paper, Select, TextInput } from "@mantine/core";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";

import { EMPLOYEE_STATUS_OPTIONS } from "~/constants";
import { buildChangedQueryPatch } from "~/lib/query-state";
import {
  employeeQueryParsers,
  employeeQueryUrlKeys,
} from "~/routes/_core+/employees+/_index/query-state";

const roleOptions = [
  { value: "true", label: "管理者" },
  { value: "false", label: "一般" },
] as const;

// 従業員一覧のフィルタ UI と URL クエリ同期を閉じ込める。
export function EmployeeFiltersPanel() {
  const [{ nameFilter, emailFilter, adminFilter, statusFilter }, setQuery] = useQueryStates(
    employeeQueryParsers,
    { urlKeys: employeeQueryUrlKeys },
  );

  // フィルタ変更時は 1 ページ目へ戻す。
  const updateFilters = (updates: {
    nameFilter?: string | null;
    emailFilter?: string | null;
    adminFilter?: string | null;
    statusFilter?: string | null;
  }) => {
    const applyImmediately = updates.nameFilter === null || updates.emailFilter === null;

    setQuery(
      buildChangedQueryPatch(updates),
      applyImmediately ? { limitUrlUpdates: undefined } : undefined,
    );
  };

  return (
    <Paper p="md" radius="sm" shadow="xs" withBorder>
      <Group align="flex-end" gap="sm">
        <TextInput
          label="氏名"
          placeholder="氏名"
          value={nameFilter ?? ""}
          onChange={(event) => updateFilters({ nameFilter: event.currentTarget.value || null })}
        />
        <TextInput
          label="メールアドレス"
          placeholder="メールアドレス"
          w={{ base: "100%", sm: 260 }}
          value={emailFilter ?? ""}
          onChange={(event) => updateFilters({ emailFilter: event.currentTarget.value || null })}
        />
        <Select
          clearable
          data={[...roleOptions]}
          label="ロール"
          placeholder="すべて"
          value={adminFilter || null}
          onChange={(value) => updateFilters({ adminFilter: value })}
        />
        <Select
          clearable
          data={EMPLOYEE_STATUS_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          label="状態"
          placeholder="すべて"
          value={statusFilter || null}
          onChange={(value) => updateFilters({ statusFilter: value })}
        />
        <Button
          leftSection={<X size={16} />}
          variant="light"
          onClick={() =>
            setQuery(
              {
                pageParam: 1,
                nameFilter: null,
                emailFilter: null,
                adminFilter: null,
                statusFilter: null,
              },
              { limitUrlUpdates: undefined },
            )
          }
        >
          条件をクリア
        </Button>
      </Group>
    </Paper>
  );
}
