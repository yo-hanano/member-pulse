import type { ReactNode } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { FieldErrorText } from "~/components/form/field-error-text";
import { SelectField } from "~/components/form/select-field";

interface MasterOption {
  code?: string | null;
  name?: string | null;
}

interface Props<TForm extends FieldValues, TOption extends MasterOption> {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
  useOptions: () => { data?: TOption[] };
  label: string;
  ariaLabel?: string;
  emptyState: string;
  popoverClassName?: string;
  fallbackValue?: string;
  getOptionContent?: (option: TOption) => ReactNode;
}

// マスタ取得とセलेकト表示をひとまとめにする共通部品。
export function MasterSelectField<TForm extends FieldValues, TOption extends MasterOption>({
  form,
  name,
  useOptions,
  label,
  ariaLabel = label,
  emptyState,
  popoverClassName,
  fallbackValue = "",
  getOptionContent,
}: Props<TForm, TOption>) {
  const { data: options } = useOptions();
  const selectedValue = form.watch(name);
  const currentValue = typeof selectedValue === "string" && selectedValue ? selectedValue : fallbackValue;
  const errorMap = form.formState.errors as Record<string, { message?: string } | undefined>;

  return (
    <div className="space-y-1">
      <SelectField
        ariaLabel={ariaLabel}
        emptyState={emptyState}
        isRequired
        items={(options ?? []).map((option) => ({
          id: option.code ?? "",
          textValue: option.name ?? "",
          content: getOptionContent ? getOptionContent(option) : option.name ?? "",
        }))}
        label={label}
        onChange={(nextValue) => {
          form.setValue(name, nextValue as never, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        popoverClassName={popoverClassName}
        value={currentValue}
      />
      <FieldErrorText message={errorMap[String(name)]?.message} />
    </div>
  );
}
