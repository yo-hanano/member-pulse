import { Input, Label, TextArea } from "@heroui/react";
import type { UseFormReturn } from "react-hook-form";
import { FieldErrorText } from "~/components/form/field-error-text";
import { MasterSelectField } from "~/components/form/master-select-field";
import { useMasterPrefectures, useMasterRelationships } from "~/hooks/useMasterData";
import { usePostalCodeAutofill } from "~/hooks/usePostalCodeAutofill";
import type { StudentForm } from "~/routes/_core+/students+/_index/student-form-schema";

interface Props {
  form: UseFormReturn<StudentForm>;
  layout?: "default" | "dense";
  variant?: "section" | "fields";
}

// 生徒フォーム内で使う保護者情報ブロック。
export function GuardianFormFields({ form, layout = "default", variant = "section" }: Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const { data: prefectures } = useMasterPrefectures();
  const postalCode = watch("guardian.postalCode");
  const isDense = layout === "dense";
  const containerClassName =
    variant === "fields"
      ? "contents"
      : isDense
        ? "md:col-span-2 xl:col-span-3 space-y-3 rounded-medium border border-separator/60 bg-surface/30 p-4"
        : "md:col-span-2 space-y-4 rounded-medium border border-separator/60 bg-surface/30 p-4";
  const gridClassName = isDense
    ? "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
    : "grid grid-cols-1 gap-4 md:grid-cols-2";
  const wideFieldClassName = isDense
    ? "space-y-1 md:col-span-2 xl:col-span-3"
    : "space-y-1 md:col-span-2";
  const sectionClassName =
    "grid gap-3 border-separator/60 border-t pt-3 first:border-t-0 first:pt-0 lg:grid-cols-[7rem_1fr]";
  const sectionTitleClassName = "text-muted-foreground pt-1 text-xs font-semibold";

  // 郵便番号から都道府県と住所を補完する。
  usePostalCodeAutofill({
    zipCode: postalCode ?? "",
    prefectures: prefectures ?? [],
    onAutofill: (result) => {
      setValue("guardian.postalCode", result.zipcode, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("guardian.prefectureCode", result.prefectureCode, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("guardian.address", result.address, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
  });

  return (
    <div className={containerClassName}>
      {variant === "section" ? (
        <div className="space-y-1">
          <h3 className="text-base font-semibold">保護者情報</h3>
          <p className="text-muted-foreground text-xs">
            主保護者を1件入力します。後から編集できます。
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>基本情報</h3>
          <div className={gridClassName}>
            <div className="space-y-1">
              <Label className="block" isRequired>
                保護者名
              </Label>
              <Input
                aria-label="保護者名"
                className="w-full"
                placeholder="例) 山田 花子"
                {...register("guardian.name")}
              />
              <FieldErrorText message={errors.guardian?.name?.message} />
            </div>

            <div className="space-y-1">
              <Label className="block">フリガナ</Label>
              <Input
                aria-label="フリガナ"
                className="w-full"
                placeholder="例) ヤマダ ハナコ"
                {...register("guardian.kana")}
              />
              <FieldErrorText message={errors.guardian?.kana?.message} />
            </div>

            <div className="space-y-1">
              <MasterSelectField
                ariaLabel="続柄"
                emptyState="該当する続柄がありません"
                fallbackValue=""
                form={form}
                label="続柄"
                name="guardian.relationshipCode"
                useOptions={useMasterRelationships}
              />
            </div>
          </div>
        </section>

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>連絡先</h3>
          <div className={gridClassName}>
            <div className="space-y-1">
              <Label className="block" isRequired>
                電話番号
              </Label>
              <Input
                aria-label="電話番号"
                className="w-full"
                placeholder="例) 090-1234-5678"
                {...register("guardian.phone")}
              />
              <FieldErrorText message={errors.guardian?.phone?.message} />
            </div>

            <div className="space-y-1">
              <Label className="block">メールアドレス</Label>
              <Input
                aria-label="メールアドレス"
                className="w-full"
                placeholder="例) hanako@example.com"
                type="email"
                {...register("guardian.email")}
              />
              <FieldErrorText message={errors.guardian?.email?.message} />
            </div>
          </div>
        </section>

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>住所</h3>
          <div className={gridClassName}>
            <div className="space-y-1">
              <Label className="block" isRequired>
                郵便番号
              </Label>
              <Input
                aria-label="郵便番号"
                className="w-full"
                placeholder="例) 123-4567"
                {...register("guardian.postalCode")}
              />
              <FieldErrorText message={errors.guardian?.postalCode?.message} />
            </div>

            <div className="space-y-1">
              <MasterSelectField
                ariaLabel="保護者の都道府県"
                emptyState="該当する都道府県がありません"
                form={form}
                label="都道府県"
                name="guardian.prefectureCode"
                useOptions={useMasterPrefectures}
              />
            </div>

            <div className={wideFieldClassName}>
              <Label className="block" isRequired>
                住所
              </Label>
              <Input
                aria-label="住所"
                className="w-full"
                placeholder="例) 名古屋市中区..."
                {...register("guardian.address")}
              />
              <FieldErrorText message={errors.guardian?.address?.message} />
            </div>
          </div>
        </section>

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>補足</h3>
          <div className={gridClassName}>
            <div className={wideFieldClassName}>
              <Label className="block">メモ</Label>
              <TextArea
                aria-label="保護者メモ"
                className="border-border w-full rounded-lg border bg-default-50 shadow-sm"
                rows={3}
                placeholder="補足があれば入力"
                {...register("guardian.note")}
              />
              <FieldErrorText message={errors.guardian?.note?.message} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
