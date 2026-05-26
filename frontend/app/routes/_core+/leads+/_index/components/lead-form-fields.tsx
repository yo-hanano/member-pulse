import { Calendar, DateField, DatePicker, Input, Label, TextArea, TimeField } from "@heroui/react";
import { parseDate, parseTime } from "@internationalized/date";
import type { UseFormReturn } from "react-hook-form";

import { FieldErrorText } from "~/components/form/field-error-text";
import { BranchAutocompleteField } from "~/components/form/branch-autocomplete-field";
import { SelectField } from "~/components/form/select-field";
import { joinDateTimeLocalValue, splitDateTimeLocalValue } from "~/lib/date";
import type { LeadForm } from "~/routes/_core+/leads+/_index/lead-form-schema";
import { leadStatusOptions } from "~/routes/_core+/leads+/_index/lead-status";

interface Props {
  form: UseFormReturn<LeadForm>;
}

const dateTimeGroupClassName =
  "border-border w-full rounded-lg border bg-default-50 shadow-sm outline-none ring-0 " +
  "focus-within:!border-border focus-within:!outline-none focus-within:!ring-0 " +
  "data-[focus-within=true]:!border-border data-[focus-within=true]:!shadow-sm data-[focus-within=true]:!ring-0";
const dateTimeSegmentClassName =
  "focus:!bg-default-100 focus:!text-foreground data-[focused=true]:!bg-default-100 data-[focused=true]:!text-foreground";

// リード作成・編集モーダルで共通利用するフォーム描画コンポーネント。
export function LeadFormFields({ form }: Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const inquiryAt = splitDateTimeLocalValue(watch("inquiryAt"));
  const setInquiryAt = (date: string, time: string) => {
    setValue("inquiryAt", joinDateTimeLocalValue(date, time), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <Label className="block" isRequired>
          問合せ日
        </Label>
        <input type="hidden" {...register("inquiryAt")} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
          <DatePicker
            aria-label="問合せ日"
            className="w-full"
            value={inquiryAt.date ? parseDate(inquiryAt.date) : null}
            onChange={(value) => setInquiryAt(value ? value.toString() : "", inquiryAt.time)}
          >
            <DateField.Group className={dateTimeGroupClassName}>
              <DateField.Input>
                {(segment) => (
                  <DateField.Segment className={dateTimeSegmentClassName} segment={segment}>
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
              <Calendar aria-label="問合せ日">
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
          <TimeField
            aria-label="問合せ時刻"
            className="w-full"
            hourCycle={24}
            value={inquiryAt.time ? parseTime(inquiryAt.time) : null}
            onChange={(value) => setInquiryAt(inquiryAt.date, value ? value.toString().slice(0, 5) : "")}
          >
            <TimeField.Group className={dateTimeGroupClassName}>
              <TimeField.Input>
                {(segment) => <TimeField.Segment className={dateTimeSegmentClassName} segment={segment} />}
              </TimeField.Input>
            </TimeField.Group>
          </TimeField>
        </div>
        <FieldErrorText message={errors.inquiryAt?.message} />
      </div>

      <BranchAutocompleteField form={form} name="branchId" label="拠点" ariaLabel="拠点" />

      <div className="space-y-1">
        <Label className="block" isRequired>
          生徒名
        </Label>
        <Input aria-label="生徒名" className="w-full" placeholder="例) 山田 太郎" {...register("studentName")} />
        <FieldErrorText message={errors.studentName?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block">生徒名かな</Label>
        <Input aria-label="生徒名かな" className="w-full" placeholder="例) ヤマダ タロウ" {...register("studentKana")} />
        <FieldErrorText message={errors.studentKana?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block">保護者名</Label>
        <Input aria-label="保護者名" className="w-full" placeholder="例) 山田 花子" {...register("guardianName")} />
        <FieldErrorText message={errors.guardianName?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block">保護者名かな</Label>
        <Input aria-label="保護者名かな" className="w-full" placeholder="例) ヤマダ ハナコ" {...register("guardianKana")} />
        <FieldErrorText message={errors.guardianKana?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block">学校名</Label>
        <Input aria-label="学校名" className="w-full" placeholder="例) 〇〇中学校" {...register("schoolName")} />
        <FieldErrorText message={errors.schoolName?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block">学年名</Label>
        <Input aria-label="学年名" className="w-full" placeholder="例) 中学2年" {...register("gradeName")} />
        <FieldErrorText message={errors.gradeName?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block">電話番号</Label>
        <Input aria-label="電話番号" className="w-full" placeholder="例) 090-1234-5678" {...register("phone")} />
        <FieldErrorText message={errors.phone?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block">メールアドレス</Label>
        <Input aria-label="メールアドレス" className="w-full" placeholder="例) sample@example.com" type="email" {...register("email")} />
        <FieldErrorText message={errors.email?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block">流入経路</Label>
        <Input aria-label="流入経路" className="w-full" placeholder="例) Web / 紹介 / チラシ" {...register("channel")} />
        <FieldErrorText message={errors.channel?.message} />
      </div>

      <div className="space-y-1">
        <SelectField
          ariaLabel="状態"
          isRequired
          items={leadStatusOptions.map((option) => ({
            id: option.value,
            textValue: option.label,
            content: option.label,
          }))}
          label="状態"
          onChange={(nextValue) => {
            setValue("status", nextValue as LeadForm["status"], {
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
          placeholder="対応メモを入力"
          {...register("note")}
        />
        <FieldErrorText message={errors.note?.message} />
      </div>
    </div>
  );
}
