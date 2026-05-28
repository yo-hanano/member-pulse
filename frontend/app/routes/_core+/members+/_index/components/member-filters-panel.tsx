import { Button, Group, Paper, Select, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";

import { useMasterLocations } from "~/hooks/useMasterData";
import { buildChangedQueryPatch } from "~/lib/query-state";
import { memberStatusOptions } from "~/routes/_core+/members+/_index/member-status";
import {
  memberQueryParsers,
  memberQueryUrlKeys,
} from "~/routes/_core+/members+/_index/query-state";

type DateRangeValue = [string | null, string | null];

// 会員一覧のフィルタ入力UIを表示し、変更内容を URL に反映する。
export function MemberFiltersPanel() {
  const [
    {
      joinedAtFromFilter,
      joinedAtToFilter,
      nameFilter,
      sourceFilter,
      locationIdFilter,
      statusFilter,
    },
    setQuery,
  ] = useQueryStates(memberQueryParsers, {
    urlKeys: memberQueryUrlKeys,
  });
  const { data: locations = [] } = useMasterLocations();

  const locationOptions = locations.map((location) => ({
    value: String(location.id),
    label: location.name ?? String(location.id),
  }));

  const joinedDateRange: DateRangeValue = [joinedAtFromFilter || null, joinedAtToFilter || null];

  // フィルタ変更時は 1 ページ目へ戻す。
  const updateFilters = (updates: {
    nameFilter?: string | null;
    sourceFilter?: string | null;
    locationIdFilter?: string | null;
    joinedAtFromFilter?: string | null;
    joinedAtToFilter?: string | null;
    statusFilter?: string | null;
  }) => {
    const applyImmediately =
      updates.nameFilter === null ||
      updates.sourceFilter === null ||
      updates.locationIdFilter !== undefined ||
      updates.joinedAtFromFilter !== undefined ||
      updates.joinedAtToFilter !== undefined ||
      updates.statusFilter !== undefined;

    setQuery(
      buildChangedQueryPatch(updates),
      applyImmediately ? { limitUrlUpdates: undefined } : undefined,
    );
  };

  const updateJoinedDateRange = (nextRange: DateRangeValue) => {
    const [from, to] = nextRange;
    updateFilters({
      joinedAtFromFilter: from || null,
      joinedAtToFilter: to || null,
    });
  };

  return (
    <Paper p="md" radius="sm" shadow="xs" withBorder>
      <Group align="flex-end" gap="sm">
        <DatePickerInput
          clearable
          allowSingleDateInRange
          label="入会日"
          labelSeparator=" - "
          placeholder="期間を選択"
          type="range"
          value={joinedDateRange}
          valueFormat="YYYY/MM/DD"
          w={{ base: "100%", sm: 280 }}
          onChange={updateJoinedDateRange}
        />
        <TextInput
          label="氏名"
          placeholder="氏名"
          value={nameFilter ?? ""}
          onChange={(event) => updateFilters({ nameFilter: event.currentTarget.value || null })}
        />
        <Select
          clearable
          data={locationOptions}
          label="拠点"
          placeholder="すべて"
          searchable
          value={locationIdFilter || null}
          w={{ base: "100%", sm: 220 }}
          onChange={(value) => updateFilters({ locationIdFilter: value })}
        />
        <TextInput
          label="流入元"
          placeholder="流入元"
          value={sourceFilter ?? ""}
          onChange={(event) => updateFilters({ sourceFilter: event.currentTarget.value || null })}
        />
        <Select
          clearable
          data={memberStatusOptions.map((option) => ({
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
                sourceFilter: null,
                locationIdFilter: null,
                joinedAtFromFilter: null,
                joinedAtToFilter: null,
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
