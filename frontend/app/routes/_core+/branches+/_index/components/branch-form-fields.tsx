import { Input, Label } from "@heroui/react";
import { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { AreaSelectField } from "~/components/form/area-select-field";
import { FieldErrorText } from "~/components/form/field-error-text";
import { SelectField } from "~/components/form/select-field";
import { usePostalCodeAutofill } from "~/hooks/usePostalCodeAutofill";
import type { PrefectureOptionFragment } from "~/generated/graphql";
import type { BranchForm } from "~/routes/_core+/branches+/_index/branch-form-schema";

interface Props {
  form: UseFormReturn<BranchForm>;
  prefectures: PrefectureOptionFragment[];
}

// 拠点作成・編集モーダルで共通利用するフォーム描画コンポーネント。
export function BranchFormFields({ form, prefectures }: Props) {
  const [prefectureKeyword, setPrefectureKeyword] = useState("");

  // 都道府県セレクトの検索語で候補を絞り込む。
  const filteredPrefectures = useMemo(() => {
    const keyword = prefectureKeyword.trim().toLowerCase();
    if (!keyword) return prefectures;
    return prefectures.filter((prefecture) => {
      const text = `${prefecture.code ?? ""} ${prefecture.name ?? ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [prefectureKeyword, prefectures]);

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const zipCode = watch("zipCode");

  // 郵便番号が7桁になったら共通 hook で都道府県と住所を補完する。
  usePostalCodeAutofill({
    zipCode,
    prefectures,
    onAutofill: ({ prefectureCode, address }) => {
      setValue("prefectureCode", prefectureCode, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("address", address, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <AreaSelectField form={form} name="areaId" />
        <FieldErrorText message={errors.areaId?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block" isRequired>
          拠点コード
        </Label>
        <Input aria-label="拠点コード" className="w-full" placeholder="例) BR-001" {...register("code")} />
        <FieldErrorText message={errors.code?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block" isRequired>
          拠点名
        </Label>
        <Input aria-label="拠点名" className="w-full" placeholder="例) 中央拠点" {...register("name")} />
        <FieldErrorText message={errors.name?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block" isRequired>
          郵便番号
        </Label>
        <Input aria-label="郵便番号" className="w-full" placeholder="例) 100-0001" {...register("zipCode")} />
        <FieldErrorText message={errors.zipCode?.message} />
      </div>

      <div className="space-y-1">
        <SelectField
          ariaLabel="都道府県"
          emptyState="該当する都道府県がありません"
          isRequired
          items={filteredPrefectures.map((prefecture) => ({
            id: String(prefecture.code),
            textValue: [prefecture.code ?? "", prefecture.name ?? ""].join(" ").trim(),
            content: prefecture.name ?? "",
          }))}
          label="都道府県"
          onChange={(nextValue) => {
            setValue("prefectureCode", nextValue, { shouldDirty: true, shouldValidate: true });
          }}
          onSearchValueChange={setPrefectureKeyword}
          popoverClassName="w-[var(--trigger-width)] min-w-[320px] p-0"
          searchFieldName="prefecture-search"
          searchPlaceholder="都道府県で検索"
          searchValue={prefectureKeyword}
          searchable
          value={watch("prefectureCode")}
        />
        <FieldErrorText message={errors.prefectureCode?.message} />
      </div>

      <div className="space-y-1 md:col-span-2">
        <Label className="block" isRequired>
          住所
        </Label>
        <Input aria-label="住所" className="w-full" placeholder="例) 東京都千代田区..." {...register("address")} />
        <FieldErrorText message={errors.address?.message} />
      </div>
    </div>
  );
}
