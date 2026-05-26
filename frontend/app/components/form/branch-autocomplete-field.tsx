import { useFilter } from "@heroui/react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { useState } from "react";

import { AutocompleteField } from "~/components/form/autocomplete-field";
import { FieldErrorText } from "~/components/form/field-error-text";
import { useBranchOptions } from "~/hooks/useBranchOptions";

interface Props<TForm extends FieldValues> {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
  label?: string;
  ariaLabel?: string;
}

// 拠点の取得と検索 UI をまとめたフォーム部品。
export function BranchAutocompleteField<TForm extends FieldValues>({
  form,
  name,
  label = "所属拠点",
  ariaLabel = "所属拠点",
}: Props<TForm>) {
  const { contains } = useFilter({ sensitivity: "base" });
  const [searchText, setSearchText] = useState("");
  const selectedValue = form.watch(name);
  const currentValue = typeof selectedValue === "string" ? selectedValue : "";
  const { data: branchOptions, loading, error } = useBranchOptions(searchText, currentValue || null);
  const errorMap = form.formState.errors as Record<string, { message?: string } | undefined>;

  return (
    <div className="space-y-1">
      <AutocompleteField
        ariaLabel={ariaLabel}
        emptyState={loading ? "拠点を検索中..." : error ? "拠点の取得に失敗しました" : "該当する拠点がありません"}
        filter={contains}
        isRequired
        items={branchOptions.map((branch) => ({
          id: branch.id ?? "",
          textValue: branch.name ?? "",
          content: (
            <div className="flex flex-col">
              <span>{branch.name ?? ""}</span>
              <span className="text-muted-foreground text-xs">
                {branch.code ?? "-"} / {branch.prefecture?.name ?? branch.prefecture?.code ?? "-"}
              </span>
            </div>
          ),
        }))}
        label={label}
        onChange={(nextValue) => {
          form.setValue(name, nextValue as never, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        onSearchValueChange={setSearchText}
        searchPlaceholder="拠点名で検索"
        searchValue={searchText}
        value={currentValue || null}
      />
      <FieldErrorText message={errorMap[String(name)]?.message} />
    </div>
  );
}
