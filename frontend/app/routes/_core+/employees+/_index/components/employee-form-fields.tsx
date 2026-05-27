import { Select, SimpleGrid, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

import { useMasterGenders } from "~/hooks/useMasterData";
import type { EmployeeForm } from "~/routes/_core+/employees+/_index/employee-form-schema";

interface Props {
  form: UseFormReturnType<EmployeeForm>;
}

const roleOptions = [
  { value: "false", label: "一般" },
  { value: "true", label: "管理者" },
] as const;

// 従業員フォームの入力欄を共通化する。
export function EmployeeFormFields({ form }: Props) {
  const { data: genders = [], loading: gendersLoading } = useMasterGenders();
  const genderOptions = genders.map((gender) => ({
    value: gender.code ?? "",
    label: gender.name ?? gender.code ?? "-",
  }));

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      <TextInput
        key={form.key("name")}
        {...form.getInputProps("name")}
        label="氏名"
        placeholder="氏名"
        withAsterisk
      />

      <TextInput
        key={form.key("email")}
        {...form.getInputProps("email")}
        label="メールアドレス"
        placeholder="name@example.com"
        withAsterisk
        type="email"
      />

      <Select
        key={form.key("genderCode")}
        {...form.getInputProps("genderCode")}
        data={genderOptions}
        label="性別"
        placeholder="性別を選択"
        withAsterisk
        searchable
        disabled={gendersLoading}
      />

      <Select
        key={form.key("isAdmin")}
        data={[...roleOptions]}
        error={form.errors.isAdmin}
        label="ロール"
        withAsterisk
        value={String(form.getValues().isAdmin)}
        onChange={(value) => {
          form.setFieldValue("isAdmin", value === "true");
        }}
      />
    </SimpleGrid>
  );
}
