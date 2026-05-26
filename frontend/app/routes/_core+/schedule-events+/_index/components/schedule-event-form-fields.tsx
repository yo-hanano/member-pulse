import { Calendar, DateField, DatePicker, Label, TextArea, TimeField } from "@heroui/react";
import { parseDate, parseTime } from "@internationalized/date";
import type { UseFormReturn } from "react-hook-form";

import { FieldErrorText } from "~/components/form/field-error-text";
import { SelectField } from "~/components/form/select-field";
import type { LeadOptionFragment } from "~/generated/graphql";
import { joinDateTimeLocalValue, splitDateTimeLocalValue } from "~/lib/date";
import type { ScheduleEventForm } from "~/routes/_core+/schedule-events+/_index/schedule-event-form-schema";
import {
  formatScheduleEventLeadLabel,
  scheduleEventStatusOptions,
  scheduleEventTypeOptions,
} from "~/routes/_core+/schedule-events+/_index/schedule-event-options";
import { useScheduleEventMasterOptions } from "~/routes/_core+/schedule-events+/_index/hooks/useScheduleEventMasterOptions";

interface Props {
  form: UseFormReturn<ScheduleEventForm>;
  leads: LeadOptionFragment[];
  fixedLead?: LeadOptionFragment | null;
}

const dateTimeGroupClassName =
  "border-border w-full rounded-lg border bg-default-50 shadow-sm outline-none ring-0 " +
  "focus-within:!border-border focus-within:!outline-none focus-within:!ring-0 " +
  "data-[focus-within=true]:!border-border data-[focus-within=true]:!shadow-sm data-[focus-within=true]:!ring-0";
const dateTimeSegmentClassName =
  "focus:!bg-default-100 focus:!text-foreground data-[focused=true]:!bg-default-100 data-[focused=true]:!text-foreground";

// 訪問・来塾予定作成・編集モーダルで共通利用するフォーム描画コンポーネント。
export function ScheduleEventFormFields({ form, leads, fixedLead }: Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const { statusOptions, typeOptions } = useScheduleEventMasterOptions();
  const leadSummary = fixedLead ? formatScheduleEventLeadLabel(fixedLead) : null;
  const activityAt = splitDateTimeLocalValue(watch("activityAt"));
  const setActivityAt = (date: string, time: string) => {
    setValue("activityAt", joinDateTimeLocalValue(date, time), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const activityTypeItems =
    typeOptions.length > 0
      ? typeOptions
          .map((option) => {
            const value = option.code ?? "";
            if (!value) return null;
            const label = option.name ?? value;
            return {
              id: value,
              textValue: label,
              content: label,
            };
          })
          .filter((item): item is { id: string; textValue: string; content: string } => Boolean(item))
      : scheduleEventTypeOptions.map((option) => ({
          id: option.value,
          textValue: option.label,
          content: option.label,
        }));

  const leadItems = leads
    .filter((lead) => lead.id != null)
    .map((lead) => {
      const label = formatScheduleEventLeadLabel(lead);
      return {
        id: String(lead.id),
        textValue: label,
        content: label,
      };
    });
  const statusItems =
    statusOptions.length > 0
      ? statusOptions
          .map((option) => {
            const value = option.code ?? "";
            if (!value) return null;
            const label = option.name ?? value;
            return {
              id: value,
              textValue: label,
              content: label,
            };
          })
          .filter((item): item is { id: string; textValue: string; content: string } => Boolean(item))
      : scheduleEventStatusOptions.map((option) => ({
          id: option.value,
          textValue: option.label,
          content: option.label,
        }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1">
        {fixedLead ? (
          <div className="space-y-1">
            <Label className="block" isRequired>
              リード
            </Label>
            <div className="border-border/60 bg-default-50 text-foreground rounded-xl border px-4 py-3 text-sm">
              <div className="font-medium">{leadSummary}</div>
              <div className="text-muted-foreground mt-1 text-xs">{fixedLead.id}</div>
            </div>
            <input type="hidden" {...register("leadId")} />
          </div>
        ) : (
          <SelectField
            ariaLabel="リード"
            emptyState="選択できるリードがありません"
            isRequired
            items={leadItems}
            label="リード"
            onChange={(nextValue) => {
              setValue("leadId", nextValue, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            popoverClassName="w-[var(--trigger-width)] min-w-[280px] p-0"
            searchable
            searchPlaceholder="リードを検索"
            value={watch("leadId")}
          />
        )}
        <FieldErrorText message={errors.leadId?.message} />
      </div>

      <div className="space-y-1">
        <SelectField
          ariaLabel="予定種別"
          isRequired
          items={activityTypeItems}
          label="予定種別"
          onChange={(nextValue) => {
            setValue("activityType", nextValue as ScheduleEventForm["activityType"], {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          popoverClassName="w-[var(--trigger-width)] min-w-[240px] p-0"
          value={watch("activityType")}
        />
        <FieldErrorText message={errors.activityType?.message} />
      </div>

      <div className="space-y-1">
        <Label className="block" isRequired>
          予定日時
        </Label>
        <input type="hidden" {...register("activityAt")} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
          <DatePicker
            aria-label="予定日"
            className="w-full"
            value={activityAt.date ? parseDate(activityAt.date) : null}
            onChange={(value) => setActivityAt(value ? value.toString() : "", activityAt.time)}
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
              <Calendar aria-label="予定日">
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
            aria-label="予定時刻"
            className="w-full"
            hourCycle={24}
            value={activityAt.time ? parseTime(activityAt.time) : null}
            onChange={(value) => setActivityAt(activityAt.date, value ? value.toString().slice(0, 5) : "")}
          >
            <TimeField.Group className={dateTimeGroupClassName}>
              <TimeField.Input>
                {(segment) => <TimeField.Segment className={dateTimeSegmentClassName} segment={segment} />}
              </TimeField.Input>
            </TimeField.Group>
          </TimeField>
        </div>
        <FieldErrorText message={errors.activityAt?.message} />
      </div>

      <div className="space-y-1">
        <SelectField
          ariaLabel="ステータス"
          isRequired
          items={statusItems}
          label="ステータス"
          onChange={(nextValue) => {
            setValue("status", nextValue, {
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
        <Label className="block">理由</Label>
        <TextArea
          aria-label="理由"
          className="border-border w-full rounded-lg border bg-default-50 shadow-sm"
          rows={3}
          placeholder="日程変更・キャンセル・未実施の理由"
          {...register("reason")}
        />
        <FieldErrorText message={errors.reason?.message} />
      </div>


      <div className="space-y-1 md:col-span-2">
        <Label className="block">メモ</Label>
        <TextArea
          aria-label="メモ"
          className="border-border w-full rounded-lg border bg-default-50 shadow-sm"
          rows={4}
          placeholder="対応内容や補足を入力"
          {...register("note")}
        />
        <FieldErrorText message={errors.note?.message} />
      </div>
    </div>
  );
}
