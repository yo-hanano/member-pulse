import { useFilter } from "@heroui/react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { useState } from "react";

import { AutocompleteField } from "~/components/form/autocomplete-field";
import { FieldErrorText } from "~/components/form/field-error-text";
import { useMasterPrefectures, useMasterSchoolTypes } from "~/hooks/useMasterData";
import { useSchoolOptions } from "~/routes/_core+/students+/_index/hooks/useSchoolOptions";

interface Props<TForm extends FieldValues> {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
  label?: string;
  ariaLabel?: string;
}

// 学校の取得と検索 UI をまとめたフォーム部品。
export function SchoolAutocompleteField<TForm extends FieldValues>({
  form,
  name,
  label = "所属学校",
  ariaLabel = "所属学校",
}: Props<TForm>) {
  const { contains } = useFilter({ sensitivity: "base" });
  const [searchText, setSearchText] = useState("");
  const selectedValue = form.watch(name);
  const currentValue = typeof selectedValue === "string" ? selectedValue : "";
  const { data: schoolOptions, loading, error } = useSchoolOptions(searchText, currentValue || null);
  const { data: prefectures } = useMasterPrefectures();
  const { data: schoolTypes } = useMasterSchoolTypes();
  const errorMap = form.formState.errors as Record<string, { message?: string } | undefined>;
  const prefectureNameByCode = new Map(
    (prefectures ?? []).map((prefecture) => [prefecture.code ?? "", prefecture.name ?? ""]),
  );
  const schoolTypeNameByCode = new Map(
    (schoolTypes ?? []).map((schoolType) => [schoolType.code ?? "", schoolType.name ?? ""]),
  );

  return (
    <div className="space-y-1">
      <AutocompleteField
        ariaLabel={ariaLabel}
        emptyState={loading ? "学校を検索中..." : error ? "学校の取得に失敗しました" : "該当する学校がありません"}
        filter={contains}
        isRequired
        items={schoolOptions.map((school) => ({
          id: school.code ?? "",
          textValue: school.name ?? "",
          content: (
            <div className="flex flex-col">
              <span>{school.name ?? ""}</span>
              <span className="text-muted-foreground text-xs">
                {prefectureNameByCode.get(school.prefectureCode ?? "") ?? school.prefectureCode ?? "-"} /{" "}
                {schoolTypeNameByCode.get(school.schoolTypeCode ?? "") ?? school.schoolTypeCode ?? "-"}
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
        searchPlaceholder="学校名で検索"
        searchValue={searchText}
        value={currentValue || null}
      />
      <FieldErrorText message={errorMap[String(name)]?.message} />
    </div>
  );
}
