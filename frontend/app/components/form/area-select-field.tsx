import { useMemo, useState } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { SelectField } from "~/components/form/select-field";
import { useMasterAreas } from "~/hooks/useMasterData";

interface Props<TForm extends FieldValues> {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
  label?: string;
  ariaLabel?: string;
  emptyState?: string;
}

// エリアの取得と検索 UI をまとめたフォーム部品。
export function AreaSelectField<TForm extends FieldValues>({
  form,
  name,
  label = "エリア",
  ariaLabel = "エリア",
  emptyState = "該当するエリアがありません",
}: Props<TForm>) {
  const { data: areas } = useMasterAreas();
  const [searchText, setSearchText] = useState("");
  const selectedValue = form.watch(name);
  const currentValue = typeof selectedValue === "string" ? selectedValue : "";

  // 検索語に応じて候補を絞り込む。
  const filteredAreas = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return areas ?? [];
    return (areas ?? []).filter((area) => {
      const text = `${area.name ?? ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [areas, searchText]);

  return (
    <SelectField
      ariaLabel={ariaLabel}
      emptyState={emptyState}
      isRequired
      items={filteredAreas.map((area) => ({
        id: String(area.id),
        textValue: (area.name ?? "").trim(),
        content: area.name ?? "",
      }))}
      label={label}
      onChange={(nextValue) => {
        form.setValue(name, nextValue as never, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }}
      onSearchValueChange={setSearchText}
      popoverClassName="w-[var(--trigger-width)] min-w-[320px] p-0"
      searchFieldName="area-search"
      searchPlaceholder="エリア名で検索"
      searchValue={searchText}
      searchable
      value={currentValue || null}
    />
  );
}
