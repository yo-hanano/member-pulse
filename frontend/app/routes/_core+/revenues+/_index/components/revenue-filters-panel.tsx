import { Button, Group, Paper, Select, TextInput } from "@mantine/core";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";

import { useMasterLocations } from "~/hooks/useMasterData";
import {
  currentMonthValue,
  revenueQueryParsers,
  revenueQueryUrlKeys,
} from "~/routes/_core+/revenues+/_index/query-state";

// 売上一覧のフィルタ（対象月・拠点）を表示し、変更内容を URL に反映する。
export function RevenueFiltersPanel() {
  const [{ monthFilter, locationIdFilter }, setQuery] = useQueryStates(revenueQueryParsers, {
    urlKeys: revenueQueryUrlKeys,
  });
  const { data: locations = [] } = useMasterLocations();

  const locationOptions = locations.map((location) => ({
    value: String(location.id),
    label: location.name ?? String(location.id),
  }));

  return (
    <Paper p="md" radius="sm" shadow="xs" withBorder>
      <Group align="flex-end" gap="md">
        <TextInput
          label="対象月"
          type="month"
          value={monthFilter ?? currentMonthValue()}
          w={180}
          onChange={(event) => setQuery({ monthFilter: event.currentTarget.value || null })}
        />
        <Select
          clearable
          data={locationOptions}
          label="拠点"
          placeholder="すべての拠点"
          value={locationIdFilter}
          w={220}
          onChange={(value) => setQuery({ locationIdFilter: value })}
        />
        <Button
          leftSection={<X size={16} />}
          variant="default"
          onClick={() => setQuery({ monthFilter: null, locationIdFilter: null })}
        >
          条件をクリア
        </Button>
      </Group>
    </Paper>
  );
}
