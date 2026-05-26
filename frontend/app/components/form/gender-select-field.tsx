import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { MasterSelectField } from "~/components/form/master-select-field";
import { useMasterGenders } from "~/hooks/useMasterData";

interface Props<TForm extends FieldValues> {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
  label?: string;
  ariaLabel?: string;
}

// 性別マスタの取得と選択 UI をまとめたフォーム部品。
export function GenderSelectField<TForm extends FieldValues>({
  form,
  name,
  label = "性別",
  ariaLabel = "性別",
}: Props<TForm>) {
  return (
    <MasterSelectField
      ariaLabel={ariaLabel}
      emptyState="該当する性別がありません"
      fallbackValue="not_specified"
      form={form}
      getOptionContent={(gender) => gender.name ?? ""}
      label={label}
      name={name}
      popoverClassName="app-select-popover"
      useOptions={useMasterGenders}
    />
  );
}
