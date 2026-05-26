import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { MasterSelectField } from "~/components/form/master-select-field";
import { useMasterSchoolGrades } from "~/hooks/useMasterData";

interface Props<TForm extends FieldValues> {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
  label?: string;
  ariaLabel?: string;
}

// 学年マスタの取得と選択 UI をまとめたフォーム部品。
export function SchoolGradeSelectField<TForm extends FieldValues>({
  form,
  name,
  label = "学年",
  ariaLabel = "学年",
}: Props<TForm>) {
  return (
    <MasterSelectField
      ariaLabel={ariaLabel}
      emptyState="該当する学年がありません"
      form={form}
      label={label}
      name={name}
      popoverClassName="w-[var(--trigger-width)] min-w-[280px] p-0"
      useOptions={useMasterSchoolGrades}
    />
  );
}
