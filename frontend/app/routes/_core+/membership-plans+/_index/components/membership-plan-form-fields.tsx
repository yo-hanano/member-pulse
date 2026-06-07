import { NumberInput, Select, SimpleGrid, Switch, Textarea, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

import { useMasterLocations } from "~/hooks/useMasterData";
import type { MembershipPlanForm } from "~/routes/_core+/membership-plans+/_index/membership-plan-form-schema";

interface Props {
  form: UseFormReturnType<MembershipPlanForm>;
}

// 月額プラン作成・編集モーダルで共通利用するフォーム描画コンポーネント。
export function MembershipPlanFormFields({ form }: Props) {
  const { data: locations = [] } = useMasterLocations();
  const locationOptions = locations.map((location) => ({
    value: String(location.id),
    label: location.name ?? String(location.id),
  }));

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      <TextInput
        key={form.key("name")}
        {...form.getInputProps("name")}
        label="プラン名"
        placeholder="例) 月4回プラン"
        withAsterisk
      />
      <NumberInput
        key={form.key("monthlyFee")}
        {...form.getInputProps("monthlyFee")}
        label="月額"
        min={0}
        prefix="¥"
        thousandSeparator=","
        withAsterisk
      />
      <Select
        key={form.key("locationId")}
        {...form.getInputProps("locationId")}
        clearable
        data={locationOptions}
        description="未選択なら全拠点共通のプランになります"
        label="拠点"
        placeholder="全拠点共通"
        searchable
      />
      <NumberInput
        key={form.key("displayOrder")}
        {...form.getInputProps("displayOrder")}
        description="入会処理のコース選択などでの並び順"
        label="表示順"
        min={0}
      />
      <Switch
        key={form.key("active")}
        {...form.getInputProps("active", { type: "checkbox" })}
        description="停止すると入会処理のコース選択に出なくなります（既存契約には影響しません）"
        label="募集中"
      />
      <Textarea
        key={form.key("note")}
        {...form.getInputProps("note")}
        className="md:col-span-2"
        label="メモ"
        minRows={3}
      />
    </SimpleGrid>
  );
}
