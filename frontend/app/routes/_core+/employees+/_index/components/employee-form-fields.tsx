import { Input, Label, ListBox, Select } from "@heroui/react";
import type { Key } from "react";
import type { UseFormReturn } from "react-hook-form";

import { FieldErrorText } from "~/components/form/field-error-text";
import { GenderSelectField } from "~/components/form/gender-select-field";
import type { EmployeeForm } from "~/routes/_core+/employees+/_index/employee-form-schema";

interface Props {
  form: UseFormReturn<EmployeeForm>;
}

const roleOptions = [
  { value: "false", label: "一般" },
  { value: "true", label: "管理者" },
] as const;

// 従業員フォームの入力欄を共通化する。
export function EmployeeFormFields({ form }: Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1 md:col-span-2">
        <Label className="block" isRequired>
          氏名
        </Label>
        <Input aria-label="氏名" className="w-full" placeholder="氏名" {...register("name")} />
        <FieldErrorText message={errors.name?.message} />
      </div>

      <div className="space-y-1 md:col-span-2">
        <Label className="block" isRequired>
          メールアドレス
        </Label>
        <Input aria-label="メールアドレス" className="w-full" placeholder="メールアドレス" type="email" {...register("email")} />
        <FieldErrorText message={errors.email?.message} />
      </div>

      <GenderSelectField form={form} name="genderCode" />

      <div className="space-y-1">
        <Select
          isRequired
          aria-label="ロール"
          value={watch("isAdmin") ? "true" : "false"}
          onChange={(key: Key | Key[] | null) => {
            setValue("isAdmin", String(key ?? "false") === "true", {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        >
          <Label isRequired>ロール</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="app-select-popover">
            <ListBox>
              {roleOptions.map((option) => (
                <ListBox.Item id={option.value} key={option.value} textValue={option.label}>
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <FieldErrorText message={errors.isAdmin?.message} />
      </div>
    </div>
  );
}
