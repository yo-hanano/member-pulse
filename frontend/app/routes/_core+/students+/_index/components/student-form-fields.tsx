import { Calendar, DateField, DatePicker, Input, Label, TextArea } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { UseFormReturn } from "react-hook-form";
import { BranchAutocompleteField } from "~/components/form/branch-autocomplete-field";
import { FieldErrorText } from "~/components/form/field-error-text";
import { GenderSelectField } from "~/components/form/gender-select-field";
import { SchoolAutocompleteField } from "~/components/form/school-autocomplete-field";
import { SchoolGradeSelectField } from "~/components/form/school-grade-select-field";
import { SelectField } from "~/components/form/select-field";
import type { StudentBaseForm } from "~/routes/_core+/students+/_index/student-form-schema";
import { studentStatusOptions } from "~/routes/_core+/students+/_index/student-status";

interface Props {
  form: UseFormReturn<StudentBaseForm>;
  layout?: "default" | "dense";
}

const dateGroupClassName =
  "border-border w-full rounded-lg border bg-default-50 shadow-sm outline-none ring-0 " +
  "focus-within:!border-border focus-within:!outline-none focus-within:!ring-0 " +
  "data-[focus-within=true]:!border-border data-[focus-within=true]:!shadow-sm data-[focus-within=true]:!ring-0";
const dateSegmentClassName =
  "focus:!bg-default-100 focus:!text-foreground data-[focused=true]:!bg-default-100 data-[focused=true]:!text-foreground";

// 生徒作成・編集モーダルで共通利用するフォーム描画コンポーネント。
export function StudentFormFields({ form, layout = "default" }: Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const birthday = watch("birthday");
  const isDense = layout === "dense";
  const gridClassName = isDense
    ? "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
    : "grid grid-cols-1 gap-4 md:grid-cols-2";
  const wideFieldClassName = isDense
    ? "space-y-1 md:col-span-2 xl:col-span-3"
    : "space-y-1 md:col-span-2";
  const sectionClassName =
    "grid gap-3 border-separator/60 border-t pt-3 first:border-t-0 first:pt-0 lg:grid-cols-[7rem_1fr]";
  const sectionTitleClassName = "text-muted-foreground pt-1 text-xs font-semibold";

  return (
    <div className="space-y-3">
      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>基本情報</h3>
        <div className={gridClassName}>
          <div className="space-y-1">
            <Label className="block" isRequired>
              生徒NO
            </Label>
            <Input
              aria-label="生徒NO"
              className="w-full"
              placeholder="例) 000123"
              {...register("code")}
            />
            <FieldErrorText message={errors.code?.message} />
          </div>

          <div className="space-y-1">
            <Label className="block" isRequired>
              名前
            </Label>
            <Input
              aria-label="名前"
              className="w-full"
              placeholder="例) 山田 太郎"
              {...register("name")}
            />
            <FieldErrorText message={errors.name?.message} />
          </div>

          <div className="space-y-1">
            <Label className="block" isRequired>
              フリガナ
            </Label>
            <Input
              aria-label="フリガナ"
              className="w-full"
              placeholder="例) ヤマダ タロウ"
              {...register("kana")}
            />
            <FieldErrorText message={errors.kana?.message} />
          </div>

          <GenderSelectField form={form} name="genderCode" />

          <div className="space-y-1">
            <Label className="block" isRequired>
              誕生日
            </Label>
            <DatePicker
              aria-label="誕生日"
              className="w-full"
              isInvalid={Boolean(errors.birthday)}
              isRequired
              name="birthday"
              value={birthday ? parseDate(birthday) : null}
              onChange={(value) => {
                setValue("birthday", value ? value.toString() : "", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <DateField.Group className={dateGroupClassName}>
                <DateField.Input>
                  {(segment) => (
                    <DateField.Segment className={dateSegmentClassName} segment={segment}>
                      {["month", "day"].includes(segment.type) && !segment.isPlaceholder
                        ? String(segment.value).padStart(2, "0")
                        : segment.text}
                    </DateField.Segment>
                  )}
                </DateField.Input>
                <DateField.Suffix>
                  <DatePicker.Trigger className="text-foreground hover:bg-default-100 data-[pressed=true]:bg-default-200">
                    <DatePicker.TriggerIndicator className="text-foreground" />
                  </DatePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>
              <DatePicker.Popover>
                <Calendar aria-label="誕生日">
                  <Calendar.Header>
                    <Calendar.YearPickerTrigger>
                      <Calendar.YearPickerTriggerHeading />
                      <Calendar.YearPickerTriggerIndicator />
                    </Calendar.YearPickerTrigger>
                    <Calendar.NavButton slot="previous" />
                    <Calendar.NavButton slot="next" />
                  </Calendar.Header>
                  <Calendar.Grid>
                    <Calendar.GridHeader>
                      {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                    </Calendar.GridHeader>
                    <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                  </Calendar.Grid>
                  <Calendar.YearPickerGrid>
                    <Calendar.YearPickerGridBody>
                      {({ year }) => <Calendar.YearPickerCell year={year} />}
                    </Calendar.YearPickerGridBody>
                  </Calendar.YearPickerGrid>
                </Calendar>
              </DatePicker.Popover>
            </DatePicker>
            <FieldErrorText message={errors.birthday?.message} />
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>所属情報</h3>
        <div className={gridClassName}>
          <BranchAutocompleteField form={form} name="branchId" />

          <SchoolAutocompleteField form={form} name="schoolCode" />

          <SchoolGradeSelectField form={form} name="schoolGradeCode" />

          <div className="space-y-1">
            <SelectField
              ariaLabel="在籍状態"
              emptyState="該当する在籍状態がありません"
              isRequired
              items={studentStatusOptions.map((option) => ({
                id: option.value,
                textValue: option.label,
                content: option.label,
              }))}
              label="在籍状態"
              onChange={(nextValue) => {
                setValue("status", nextValue as StudentBaseForm["status"], {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              popoverClassName="w-[var(--trigger-width)] min-w-[240px] p-0"
              value={watch("status")}
            />
            <FieldErrorText message={errors.status?.message} />
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>補足</h3>
        <div className={gridClassName}>
          <div className={wideFieldClassName}>
            <Label className="block">メモ</Label>
            <TextArea
              aria-label="メモ"
              className="border-border w-full rounded-lg border bg-default-50 shadow-sm"
              rows={3}
              placeholder="補足があれば入力"
              {...register("note")}
            />
            <FieldErrorText message={errors.note?.message} />
          </div>
        </div>
      </section>
    </div>
  );
}
