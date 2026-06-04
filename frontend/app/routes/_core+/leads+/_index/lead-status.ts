// リード状態の選択肢を一覧・フォームで共通利用する。
export const leadStatusValues = [
  "new",
  "contacted",
  "trial_scheduled",
  "trial_completed",
  "contracted",
  "enrolled",
  "lost",
] as const;

export type LeadStatus = (typeof leadStatusValues)[number];

export const leadStatusOptions = [
  { value: "new", label: "新規" },
  { value: "contacted", label: "連絡済み" },
  { value: "trial_scheduled", label: "体験予定" },
  { value: "trial_completed", label: "体験済み" },
  { value: "contracted", label: "成約" },
  { value: "enrolled", label: "入会済み" },
  { value: "lost", label: "不成約" },
] as const;

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "新規",
  contacted: "連絡済み",
  trial_scheduled: "体験予定",
  trial_completed: "体験済み",
  contracted: "成約",
  enrolled: "入会済み",
  lost: "不成約",
};

export const formatLeadStatus = (value?: string | null) => {
  if (!value) return "-";
  const key = value.trim().toLowerCase() as LeadStatus;
  return leadStatusLabels[key] ?? value;
};

export const leadStatusBadgeColor = (value?: string | null) => {
  const key = value?.trim().toLowerCase();
  if (key === "trial_scheduled" || key === "trial_completed") return "yellow";
  if (key === "contacted" || key === "contracted" || key === "enrolled") return "teal";
  if (key === "lost") return "red";
  return "gray";
};

export const leadStatusColor = (
  value?: string | null,
): "success" | "warning" | "default" | "danger" => {
  const key = value?.trim().toLowerCase();
  if (key === "trial_scheduled" || key === "trial_completed") return "warning";
  if (key === "contacted" || key === "contracted" || key === "enrolled") return "success";
  if (key === "lost") return "danger";
  return "default";
};
