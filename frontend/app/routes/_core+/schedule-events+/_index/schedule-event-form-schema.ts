import { z } from "zod";
import { toDateTimeLocalValue } from "~/lib/date";
import { requiredString } from "~/lib/zod-helpers";
import { scheduleEventTypeValues } from "~/routes/_core+/schedule-events+/_index/schedule-event-options";

// 訪問・来塾予定作成・編集フォームの共通バリデーション。
export const scheduleEventFormSchema = z
  .object({
    leadId: requiredString("リード"),
    activityType: z.enum(scheduleEventTypeValues),
    activityAt: z.string().trim().min(1, { message: "予定日時を入力してください" }),
    status: z.string().trim().min(1, { message: "ステータスを入力してください" }),
    reason: z.string().max(1000).optional().or(z.literal("")),
    note: z.string().max(1000).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    // DB の理由必須制約に合わせて、未実施・日程変更・キャンセルでは理由を必須にする。
    if (["not_done", "rescheduled", "canceled"].includes(value.status) && !value.reason?.trim()) {
      ctx.addIssue({ code: "custom", path: ["reason"], message: "理由を入力してください" });
    }
  });

export type ScheduleEventForm = z.infer<typeof scheduleEventFormSchema>;

// フォーム初期値（作成時のデフォルト値）。
export const buildEmptyScheduleEventForm = (): ScheduleEventForm => ({
  leadId: "",
  activityType: "trial_lesson",
  activityAt: toDateTimeLocalValue(new Date()),
  status: "planned",
  reason: "",
  note: "",
});
