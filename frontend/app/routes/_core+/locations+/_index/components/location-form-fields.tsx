import { Select, SimpleGrid, Switch, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

import { useMasterAreas, useMasterPrefectures } from "~/hooks/useMasterData";
import type { LocationForm } from "~/routes/_core+/locations+/_index/location-form-schema";

interface Props {
  form: UseFormReturnType<LocationForm>;
  lockDefaultOff?: boolean;
}

// 拠点フォームの入力欄を共通化する。
export function LocationFormFields({ form, lockDefaultOff }: Props) {
  const { data: areas = [], loading: areasLoading } = useMasterAreas();
  const { data: prefectures = [], loading: prefecturesLoading } = useMasterPrefectures();

  const areaOptions = areas.map((area) => ({
    value: area.id ?? "",
    label: area.name ?? area.id ?? "-",
  }));
  const prefectureOptions = prefectures.map((prefecture) => ({
    value: prefecture.code ?? "",
    label: prefecture.name ?? prefecture.code ?? "-",
  }));

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      <TextInput
        key={form.key("name")}
        {...form.getInputProps("name")}
        label="拠点名"
        placeholder="例）本店スタジオ"
        withAsterisk
      />

      <Select
        key={form.key("areaId")}
        {...form.getInputProps("areaId")}
        clearable
        data={areaOptions}
        disabled={areasLoading}
        label="エリア"
        placeholder="エリアを選択"
        searchable
      />

      <TextInput
        key={form.key("zipCode")}
        {...form.getInputProps("zipCode")}
        inputMode="numeric"
        label="郵便番号"
        placeholder="例）100-0001"
      />

      <Select
        key={form.key("prefectureCode")}
        {...form.getInputProps("prefectureCode")}
        clearable
        data={prefectureOptions}
        disabled={prefecturesLoading}
        label="都道府県"
        placeholder="都道府県を選択"
        searchable
      />

      <TextInput
        key={form.key("address")}
        {...form.getInputProps("address")}
        label="住所"
        placeholder="市区町村・番地・建物名"
      />

      <Switch
        key={form.key("isDefault")}
        {...form.getInputProps("isDefault", { type: "checkbox" })}
        disabled={lockDefaultOff}
        label="デフォルト拠点"
      />
    </SimpleGrid>
  );
}
