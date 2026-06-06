import { Select, SimpleGrid, Textarea, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

import { useMasterLocations } from "~/hooks/useMasterData";
import type { LeadForm } from "~/routes/_core+/leads+/_index/lead-form-schema";

interface Props {
  form: UseFormReturnType<LeadForm>;
}

// リード作成・編集モーダルで共通利用するフォーム描画コンポーネント。
// 状態は対応履歴（体験・不通・キャンセル・成約・不成約などの記録）から導出されるため、ここでは扱わない。
export function LeadFormFields({ form }: Props) {
  const { data: locations = [] } = useMasterLocations();
  const locationOptions = locations.map((location) => ({
    value: String(location.id),
    label: location.name ?? String(location.id),
  }));

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      <TextInput
        key={form.key("inquiryAt")}
        {...form.getInputProps("inquiryAt")}
        label="問合せ日"
        type="datetime-local"
        withAsterisk
      />
      <Select
        key={form.key("locationId")}
        {...form.getInputProps("locationId")}
        clearable
        data={locationOptions}
        label="拠点"
        placeholder="項目を選択"
        searchable
      />
      <TextInput
        key={form.key("name")}
        {...form.getInputProps("name")}
        label="氏名"
        placeholder="例) 山田 太郎"
        withAsterisk
      />
      <TextInput
        key={form.key("phone")}
        {...form.getInputProps("phone")}
        label="電話番号"
        placeholder="例) 090-1234-5678"
      />
      <TextInput
        key={form.key("email")}
        {...form.getInputProps("email")}
        label="メールアドレス"
        placeholder="例) sample@example.com"
        type="email"
      />
      <TextInput
        key={form.key("source")}
        {...form.getInputProps("source")}
        label="流入元"
        placeholder="例) Web / 紹介 / チラシ"
      />
      <TextInput
        key={form.key("nextContactAt")}
        {...form.getInputProps("nextContactAt")}
        description="保留・追客の連絡予定日時"
        label="次回連絡日"
        type="datetime-local"
      />
      <TextInput
        key={form.key("lostAt")}
        {...form.getInputProps("lostAt")}
        label="不成約日時"
        type="datetime-local"
      />
      <TextInput
        key={form.key("lostReason")}
        {...form.getInputProps("lostReason")}
        className="md:col-span-2"
        label="不成約理由"
        placeholder="例) 価格が合わない"
      />
      <Textarea
        key={form.key("note")}
        {...form.getInputProps("note")}
        className="md:col-span-2"
        label="メモ"
        minRows={4}
        placeholder="対応メモを入力"
      />
    </SimpleGrid>
  );
}
