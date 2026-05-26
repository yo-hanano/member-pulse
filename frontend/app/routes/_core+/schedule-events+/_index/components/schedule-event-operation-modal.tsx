import { Button, Calendar, DateField, DatePicker, Label, Modal, TextArea, TimeField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate, parseTime } from "@internationalized/date";
import { CalendarClock } from "lucide-react";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRevalidator } from "react-router";
import { z } from "zod";

import { FieldErrorText } from "~/components/form/field-error-text";
import { SelectField } from "~/components/form/select-field";
import { joinDateTimeLocalValue, splitDateTimeLocalValue, toDateTimeLocalValue } from "~/lib/date";
import { scheduleEventTypeOptions } from "~/routes/_core+/schedule-events+/_index/schedule-event-options";
import { useScheduleEventOperation } from "~/routes/_core+/schedule-events+/_index/hooks/useScheduleEventOperation";

export type ScheduleEventOperationMode = "reschedule" | "cancel" | "done";

const schema = z
  .object({
    activityAt: z.string().optional().or(z.literal("")),
    activityType: z.string().optional().or(z.literal("")),
    mode: z.enum(["reschedule", "cancel", "done"]),
    note: z.string().max(1000).optional().or(z.literal("")),
    reason: z.string().max(1000).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    // 操作種別ごとに最小限必要な入力を切り替える。
    if (value.mode === "reschedule" && !value.activityAt) {
      ctx.addIssue({ code: "custom", path: ["activityAt"], message: "次の予定日時を入力してください" });
    }
    if (["reschedule", "cancel"].includes(value.mode) && !value.reason) {
      ctx.addIssue({ code: "custom", path: ["reason"], message: "理由を入力してください" });
    }
  });

type OperationForm = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  mode: ScheduleEventOperationMode | null;
  scheduleEventId: string | null;
  onOpenChange: (open: boolean) => void;
}

const labels: Record<ScheduleEventOperationMode, string> = {
  reschedule: "日程変更",
  cancel: "キャンセル",
  done: "実施済み",
};

const dateTimeGroupClassName =
  "border-border w-full rounded-lg border bg-default-50 shadow-sm outline-none ring-0 " +
  "focus-within:!border-border focus-within:!outline-none focus-within:!ring-0 " +
  "data-[focus-within=true]:!border-border data-[focus-within=true]:!shadow-sm data-[focus-within=true]:!ring-0";
const dateTimeSegmentClassName =
  "focus:!bg-default-100 focus:!text-foreground data-[focused=true]:!bg-default-100 data-[focused=true]:!text-foreground";

// 予定履歴の最新行に対する操作フォーム。
export function ScheduleEventOperationModal({ isOpen, mode, scheduleEventId, onOpenChange }: Props) {
  const form = useForm<OperationForm>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      activityAt: toDateTimeLocalValue(new Date()),
      activityType: "trial_lesson",
      mode: mode ?? "reschedule",
      note: "",
      reason: "",
    },
  });
  const revalidator = useRevalidator();
  const operation = useScheduleEventOperation(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });
  const activityAt = splitDateTimeLocalValue(form.watch("activityAt"));
  const setActivityAt = (date: string, time: string) => {
    form.setValue("activityAt", joinDateTimeLocalValue(date, time), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // モーダルを開くたびに操作モードに応じた初期値へ戻す。
  useEffect(() => {
    if (!isOpen || !mode) return;
    form.reset({
      activityAt: toDateTimeLocalValue(new Date()),
      activityType: "trial_lesson",
      mode,
      note: "",
      reason: "",
    });
  }, [form, isOpen, mode]);

  const onValid: SubmitHandler<OperationForm> = (data) => {
    if (!scheduleEventId) return;
    operation.submit(data, [{ scheduleEventId }]);
  };

  const title = mode ? labels[mode] : "予定操作";

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container className="max-w-2xl">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <CalendarClock className="size-5 text-gray-700" />
              </span>
              <span>{title}</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="grid grid-cols-1 gap-4">
              {mode === "reschedule" ? (
                <>
                  <SelectField
                    ariaLabel="予定種別"
                    items={scheduleEventTypeOptions.map((option) => ({ id: option.value, textValue: option.label, content: option.label }))}
                    label="予定種別"
                    onChange={(value) => form.setValue("activityType", value, { shouldDirty: true, shouldValidate: true })}
                    value={form.watch("activityType") ?? null}
                  />
                  <div className="space-y-1">
                    <Label className="block" isRequired>次の予定日時</Label>
                    <input type="hidden" {...form.register("activityAt")} />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
                      <DatePicker
                        aria-label="次の予定日"
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
                          <Calendar aria-label="次の予定日">
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
                        aria-label="次の予定時刻"
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
                    <FieldErrorText message={form.formState.errors.activityAt?.message} />
                  </div>
                </>
              ) : null}

              {mode && ["reschedule", "cancel"].includes(mode) ? (
                <div className="space-y-1">
                  <Label className="block" isRequired>理由</Label>
                  <TextArea
                    aria-label="理由"
                    className="border-border w-full rounded-lg border bg-default-50 shadow-sm"
                    rows={4}
                    {...form.register("reason")}
                  />
                  <FieldErrorText message={form.formState.errors.reason?.message} />
                </div>
              ) : null}

              <div className="space-y-1">
                <Label className="block">メモ</Label>
                <TextArea
                  aria-label="メモ"
                  className="border-border w-full rounded-lg border bg-default-50 shadow-sm"
                  rows={4}
                  {...form.register("note")}
                />
                <FieldErrorText message={form.formState.errors.note?.message} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button className="app-primary-button" isPending={operation.submitting} onPress={() => void form.handleSubmit(onValid)()}>
              登録
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
