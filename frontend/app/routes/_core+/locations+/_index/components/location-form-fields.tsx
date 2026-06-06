import { Select, SimpleGrid, Switch, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useState } from "react";

import { useMasterAreas, useMasterPrefectures } from "~/hooks/useMasterData";
import { usePostalCodeAutofill } from "~/hooks/usePostalCodeAutofill";
import type { LocationForm } from "~/routes/_core+/locations+/_index/location-form-schema";

interface Props {
  form: UseFormReturnType<LocationForm>;
  lockDefaultOff?: boolean;
}

// 拠点フォームの入力欄を共通化する。
export function LocationFormFields({ form, lockDefaultOff }: Props) {
  const { data: areas = [], loading: areasLoading } = useMasterAreas();
  const { data: prefectures = [], loading: prefecturesLoading } = useMasterPrefectures();

  // 郵便番号のユーザー入力値。初期表示の既存値では補完を発火させず、入力時のみ反応させる。
  const [zipCodeInput, setZipCodeInput] = useState("");
  usePostalCodeAutofill({
    zipCode: zipCodeInput,
    prefectures,
    onAutofill: (result) => {
      // 都道府県は専用カラムへ、住所には市区町村以下を補完する。
      form.setFieldValue("prefectureCode", result.prefectureCode);
      form.setFieldValue("address", result.address);
    },
  });
  const zipCodeProps = form.getInputProps("zipCode");

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
        {...zipCodeProps}
        description="7桁を入力すると都道府県・住所を自動補完します"
        inputMode="numeric"
        label="郵便番号"
        placeholder="例）100-0001"
        onChange={(event) => {
          zipCodeProps.onChange(event);
          setZipCodeInput(event.currentTarget.value);
        }}
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
