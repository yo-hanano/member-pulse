import { NumberInput, SimpleGrid, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

import type { AreaForm } from "~/routes/_core+/areas+/_index/area-form-schema";

interface Props {
  form: UseFormReturnType<AreaForm>;
}

// エリア作成・編集モーダルで共通利用するフォーム描画コンポーネント
export function AreaFormFields({ form }: Props) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      <TextInput
        key={form.key("name")}
        {...form.getInputProps("name")}
        className="md:col-span-2"
        label="エリア名"
        placeholder="エリア名"
        withAsterisk
      />
      <NumberInput
        key={form.key("dispOrder")}
        {...form.getInputProps("dispOrder")}
        allowDecimal={false}
        label="表示順"
        placeholder="表示順（任意）"
      />
    </SimpleGrid>
  );
}
