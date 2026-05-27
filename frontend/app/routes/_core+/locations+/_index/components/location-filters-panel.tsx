import { Button, Group, Paper, Select, TextInput } from "@mantine/core";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";

import { useMasterAreas, useMasterPrefectures } from "~/hooks/useMasterData";
import { buildChangedQueryPatch } from "~/lib/query-state";
import {
  locationQueryParsers,
  locationQueryUrlKeys,
} from "~/routes/_core+/locations+/_index/query-state";

// 拠点一覧のフィルタ UI と URL クエリ同期を閉じ込める。
export function LocationFiltersPanel() {
  const [{ nameFilter, areaFilter, prefectureFilter }, setQuery] = useQueryStates(
    locationQueryParsers,
    { urlKeys: locationQueryUrlKeys },
  );
  const { data: areas = [], loading: areasLoading } = useMasterAreas();
  const { data: prefectures = [], loading: prefecturesLoading } = useMasterPrefectures();

  const areaOptions = areas.map((area) => ({ value: area.id ?? "", label: area.name ?? "-" }));
  const prefectureOptions = prefectures.map((prefecture) => ({
    value: prefecture.code ?? "",
    label: prefecture.name ?? "-",
  }));

  // フィルタ変更時は 1 ページ目へ戻す。
  const updateFilters = (updates: {
    nameFilter?: string | null;
    areaFilter?: string | null;
    prefectureFilter?: string | null;
  }) => {
    const applyImmediately = updates.nameFilter === null;
    setQuery(
      buildChangedQueryPatch(updates),
      applyImmediately ? { limitUrlUpdates: undefined } : undefined,
    );
  };

  return (
    <Paper p="md" radius="sm" shadow="xs" withBorder>
      <Group align="flex-end" gap="sm">
        <TextInput
          label="拠点名"
          placeholder="拠点名"
          value={nameFilter ?? ""}
          onChange={(event) => updateFilters({ nameFilter: event.currentTarget.value || null })}
        />
        <Select
          clearable
          data={areaOptions}
          disabled={areasLoading}
          label="エリア"
          placeholder="すべて"
          searchable
          value={areaFilter || null}
          onChange={(value) => updateFilters({ areaFilter: value })}
        />
        <Select
          clearable
          data={prefectureOptions}
          disabled={prefecturesLoading}
          label="都道府県"
          placeholder="すべて"
          searchable
          value={prefectureFilter || null}
          onChange={(value) => updateFilters({ prefectureFilter: value })}
        />
        <Button
          leftSection={<X size={16} />}
          variant="light"
          onClick={() =>
            setQuery(
              {
                pageParam: 1,
                nameFilter: null,
                areaFilter: null,
                prefectureFilter: null,
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
