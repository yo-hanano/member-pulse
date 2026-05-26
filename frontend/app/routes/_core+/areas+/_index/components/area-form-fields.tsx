import { Input, Label } from "@heroui/react";
import type { UseFormReturn } from "react-hook-form";
import { FieldErrorText } from "~/components/form/field-error-text";
import type { AreaForm } from "~/routes/_core+/areas+/_index/area-form-schema";

interface Props {
  form: UseFormReturn<AreaForm>;
}

// エリア作成・編集モーダルで共通利用するフォーム描画コンポーネント
export function AreaFormFields({ form }: Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1 md:col-span-2">
        <Label className="block" isRequired>
          エリア名
        </Label>
        <Input aria-label="エリア名" className="w-full" placeholder="エリア名" {...register("name")} />
        <FieldErrorText message={errors.name?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block">表示順</Label>
        <Input
          aria-label="表示順"
          className="w-full"
          placeholder="表示順（任意）"
          type="number"
          {...register("dispOrder", {
            setValueAs: (value) => {
              if (value === "" || value == null) return undefined;
              const parsed = Number(value);
              return Number.isNaN(parsed) ? undefined : parsed;
            },
          })}
        />
        <FieldErrorText message={errors.dispOrder?.message} />
      </div>
    </div>
  );
}
