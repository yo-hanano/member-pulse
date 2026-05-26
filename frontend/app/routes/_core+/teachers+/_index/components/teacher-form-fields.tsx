import { Calendar, DateField, DatePicker, Input, Label, TextArea } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { UseFormReturn } from "react-hook-form";

import { FieldErrorText } from "~/components/form/field-error-text";
import { GenderSelectField } from "~/components/form/gender-select-field";
import { SchoolAutocompleteField } from "~/components/form/school-autocomplete-field";
import { SchoolGradeSelectField } from "~/components/form/school-grade-select-field";
import { SelectField } from "~/components/form/select-field";
import type { TeacherForm } from "~/routes/_core+/teachers+/_index/teacher-form-schema";
import { teacherStatusOptions } from "~/routes/_core+/teachers+/_index/teacher-status";

interface Props {
  form: UseFormReturn<TeacherForm>;
}

const dateGroupClassName =
  "border-border w-full rounded-lg border bg-default-50 shadow-sm outline-none ring-0 " +
  "focus-within:!border-border focus-within:!outline-none focus-within:!ring-0 " +
  "data-[focus-within=true]:!border-border data-[focus-within=true]:!shadow-sm data-[focus-within=true]:!ring-0";
const dateSegmentClassName =
  "focus:!bg-default-100 focus:!text-foreground data-[focused=true]:!bg-default-100 data-[focused=true]:!text-foreground";

// 講師作成・編集モーダルで共通利用するフォーム描画コンポーネント。
export function TeacherFormFields({ form }: Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const birthday = watch("birthday");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <Label className="block" isRequired>
          講師NO
        </Label>
        <Input aria-label="講師NO" className="w-full" placeholder="例) T0001" {...register("code")} />
        <FieldErrorText message={errors.code?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block" isRequired>
          名前
        </Label>
        <Input aria-label="名前" className="w-full" placeholder="例) 山田 太郎" {...register("name")} />
        <FieldErrorText message={errors.name?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block" isRequired>
          フリガナ
        </Label>
        <Input aria-label="フリガナ" className="w-full" placeholder="例) ヤマダ タロウ" {...register("kana")} />
        <FieldErrorText message={errors.kana?.message} />
      </div>

      <GenderSelectField form={form} name="genderCode" />

      <div className="space-y-1">
        <Label className="block">誕生日</Label>
        <DatePicker
          aria-label="誕生日"
          className="w-full"
          isInvalid={Boolean(errors.birthday)}
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
                <Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
                <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>{({ year }) => <Calendar.YearPickerCell year={year} />}</Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
          </DatePicker.Popover>
        </DatePicker>
        <FieldErrorText message={errors.birthday?.message} />
      </div>

      <SchoolAutocompleteField form={form} name="schoolCode" />

      <SchoolGradeSelectField form={form} name="schoolGradeCode" />

      <div className="space-y-1">
        <Label className="block">電話番号</Label>
        <Input aria-label="電話番号" className="w-full" placeholder="例) 03-1234-5678" type="tel" {...register("phone")} />
        <FieldErrorText message={errors.phone?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block">メールアドレス</Label>
        <Input aria-label="メールアドレス" className="w-full" placeholder="例) teacher@example.com" type="email" {...register("email")} />
        <FieldErrorText message={errors.email?.message} />
      </div>

      <div className="space-y-1">
        <SelectField
          ariaLabel="在籍状態"
          emptyState="該当する在籍状態がありません"
          isRequired
          items={teacherStatusOptions.map((option) => ({
            id: option.value,
            textValue: option.label,
            content: option.label,
          }))}
          label="在籍状態"
          onChange={(nextValue) => {
            setValue("status", nextValue as TeacherForm["status"], {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          popoverClassName="w-[var(--trigger-width)] min-w-[240px] p-0"
          value={watch("status")}
        />
        <FieldErrorText message={errors.status?.message} />
      </div>

      <div className="space-y-1 md:col-span-2">
        <Label className="block">メモ</Label>
        <TextArea
          aria-label="メモ"
          className="border-border w-full rounded-lg border bg-default-50 shadow-sm"
          rows={4}
          placeholder="補足があれば入力"
          {...register("note")}
        />
        <FieldErrorText message={errors.note?.message} />
      </div>
    </div>
  );
}
