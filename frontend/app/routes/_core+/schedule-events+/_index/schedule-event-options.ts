import type { LeadOptionFragment } from "~/generated/graphql";

// 訪問・来塾予定の種別コードを一覧・フォームで共通利用する。
export const scheduleEventTypeValues = ["trial_lesson", "interview"] as const;

export type ScheduleEventActivityType = (typeof scheduleEventTypeValues)[number];

export const scheduleEventTypeOptions = [
  { value: "trial_lesson", label: "体験授業" },
  { value: "interview", label: "面談" },
] as const;

export const scheduleEventTypeLabels: Record<ScheduleEventActivityType, string> = {
  trial_lesson: "体験授業",
  interview: "面談",
};

export const formatScheduleEventType = (value?: string | null) => {
  if (!value) return "-";
  const key = value.trim().toLowerCase() as ScheduleEventActivityType;
  return scheduleEventTypeLabels[key] ?? value;
};

export const scheduleEventTypeColor = (value?: string | null): "success" | "warning" | "default" | "danger" => {
  const key = value?.trim().toLowerCase();
  if (key === "interview") return "warning";
  if (key === "trial_lesson") return "success";
  return "default";
};

export const scheduleEventStatusLabels = {
  planned: "予定",
  not_done: "未実施",
  rescheduled: "日程変更済み",
  done: "実施済み",
  canceled: "キャンセル",
} as const;

export const scheduleEventStatusValues = Object.keys(scheduleEventStatusLabels) as Array<
  keyof typeof scheduleEventStatusLabels
>;

export const scheduleEventStatusOptions = [
  { value: "planned", label: "予定" },
  { value: "not_done", label: "未実施" },
  { value: "rescheduled", label: "日程変更済み" },
  { value: "done", label: "実施済み" },
  { value: "canceled", label: "キャンセル" },
] as const;

// 予定ステータスのコードを一覧・フォームで共通利用する。
export const formatScheduleEventStatus = (value?: string | null) => {
  if (!value) return "-";
  const key = value.trim().toLowerCase() as keyof typeof scheduleEventStatusLabels;
  return scheduleEventStatusLabels[key] ?? value;
};

export const scheduleEventStatusColor = (value?: string | null): "success" | "warning" | "default" | "danger" => {
  const key = value?.trim().toLowerCase();
  if (key === "planned") return "warning";
  if (key === "done") return "success";
  if (key === "not_done" || key === "canceled") return "danger";
  if (key === "rescheduled") return "warning";
  return "default";
};

// リード選択で表示するラベルを整形する。
export const formatScheduleEventLeadLabel = (
  lead: Pick<LeadOptionFragment, "id" | "studentName" | "guardianName" | "schoolName">,
) => {
  const parts = [lead.studentName, lead.guardianName, lead.schoolName].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(" / ");
  }
  return `リード ${lead.id}`;
};
