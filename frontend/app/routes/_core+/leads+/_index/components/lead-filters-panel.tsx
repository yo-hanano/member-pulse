import { Button, Group, Paper, Select, TextInput } from "@mantine/core";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";

import { useMasterLocations } from "~/hooks/useMasterData";
import { buildChangedQueryPatch } from "~/lib/query-state";
import { leadStatusOptions } from "~/routes/_core+/leads+/_index/lead-status";
import { leadQueryParsers, leadQueryUrlKeys } from "~/routes/_core+/leads+/_index/query-state";

// リード一覧のフィルタ入力UIを表示し、変更内容を URL に反映する。
export function LeadFiltersPanel() {
  const [
    {
      inquiryAtFromFilter,
      inquiryAtToFilter,
      nameFilter,
      sourceFilter,
      locationIdFilter,
      statusFilter,
    },
    setQuery,
  ] = useQueryStates(leadQueryParsers, {
    urlKeys: leadQueryUrlKeys,
  });
  const { data: locations = [] } = useMasterLocations();

  const locationOptions = locations.map((location) => ({
    value: String(location.id),
    label: location.name ?? String(location.id),
  }));

  // フィルタ変更時は 1 ページ目へ戻す。
  const updateFilters = (updates: {
    nameFilter?: string | null;
    sourceFilter?: string | null;
    locationIdFilter?: string | null;
    inquiryAtFromFilter?: string | null;
    inquiryAtToFilter?: string | null;
    statusFilter?: string | null;
  }) => {
    const applyImmediately =
      updates.nameFilter === null ||
      updates.sourceFilter === null ||
      updates.locationIdFilter !== undefined ||
      updates.inquiryAtFromFilter !== undefined ||
      updates.inquiryAtToFilter !== undefined ||
      updates.statusFilter !== undefined;

    setQuery(
      buildChangedQueryPatch(updates),
      applyImmediately ? { limitUrlUpdates: undefined } : undefined,
    );
  };

  return (
    <Paper p="md" radius="sm" shadow="xs" withBorder>
      <Group align="flex-end" gap="sm">
        <TextInput
          label="問合せ日From"
          type="date"
          value={inquiryAtFromFilter ?? ""}
          onChange={(event) =>
            updateFilters({ inquiryAtFromFilter: event.currentTarget.value || null })
          }
        />
        <TextInput
          label="問合せ日To"
          type="date"
          value={inquiryAtToFilter ?? ""}
          onChange={(event) =>
            updateFilters({ inquiryAtToFilter: event.currentTarget.value || null })
          }
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
          data={leadStatusOptions.map((option) => ({
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
                inquiryAtFromFilter: null,
                inquiryAtToFilter: null,
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
