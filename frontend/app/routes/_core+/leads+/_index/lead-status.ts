// リード状態の選択肢を一覧・フォームで共通利用する。
export const leadStatusValues = ["new", "visit_scheduled", "contracted", "lost", "enrolled"] as const;

export type LeadStatus = (typeof leadStatusValues)[number];

export const leadStatusOptions = [
  { value: "new", label: "新規" },
  { value: "visit_scheduled", label: "来塾予定" },
  { value: "contracted", label: "成約" },
  { value: "lost", label: "不成約" },
  { value: "enrolled", label: "入会済" },
] as const;

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "新規",
  visit_scheduled: "来塾予定",
  contracted: "成約",
  lost: "不成約",
  enrolled: "入会済",
};

export const formatLeadStatus = (value?: string | null) => {
  if (!value) return "-";
  const key = value.trim().toLowerCase() as LeadStatus;
  return leadStatusLabels[key] ?? value;
};

export const leadStatusColor = (value?: string | null): "success" | "warning" | "default" | "danger" => {
  const key = value?.trim().toLowerCase();
  if (key === "visit_scheduled") return "warning";
  if (key === "contracted") return "success";
  if (key === "enrolled") return "success";
  if (key === "lost") return "danger";
  return "default";
};
