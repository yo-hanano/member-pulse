// リード状態の選択肢を一覧・フィルタで共通利用する。
// キャンセル = 体験前の失敗（再予約で復帰可能）、不成約 = 体験後の失敗（終端）。
export const leadStatusValues = [
  "new",
  "unreachable",
  "trial_scheduled",
  "trial_completed",
  "canceled",
  "contracted",
  "enrolled",
  "lost",
] as const;

export type LeadStatus = (typeof leadStatusValues)[number];

export const leadStatusOptions = [
  { value: "new", label: "新規" },
  { value: "unreachable", label: "不通" },
  { value: "trial_scheduled", label: "体験予定" },
  { value: "trial_completed", label: "体験済み" },
  { value: "canceled", label: "キャンセル" },
  { value: "contracted", label: "成約" },
  { value: "enrolled", label: "入会済み" },
  { value: "lost", label: "不成約" },
] as const;

// 状態は対応履歴（体験・不通・キャンセル・成約・不成約・入会の記録）からのみ変わる。手動のセレクト変更は提供しない。
export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "新規",
  unreachable: "不通",
  trial_scheduled: "体験予定",
  trial_completed: "体験済み",
  canceled: "キャンセル",
  contracted: "成約",
  enrolled: "入会済み",
  lost: "不成約",
};

export const formatLeadStatus = (value?: string | null) => {
  if (!value) return "-";
  const key = value.trim().toLowerCase() as LeadStatus;
  return leadStatusLabels[key] ?? value;
};

// 体験系・キャンセルは対応履歴の体験エントリと同じ色に揃え、同じ事実が別の色で見えないようにする。
export const leadStatusBadgeColor = (value?: string | null) => {
  const key = value?.trim().toLowerCase();
  if (key === "new") return "indigo";
  if (key === "unreachable") return "orange";
  if (key === "trial_scheduled") return "blue";
  if (key === "trial_completed") return "teal";
  if (key === "canceled") return "gray";
  if (key === "contracted" || key === "enrolled") return "green";
  if (key === "lost") return "red";
  return "gray";
};
