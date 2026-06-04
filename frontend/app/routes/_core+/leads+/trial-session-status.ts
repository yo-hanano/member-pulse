export const trialSessionStatusValues = ["scheduled", "completed", "canceled"] as const;

export const trialSessionStatusOptions: {
  value: (typeof trialSessionStatusValues)[number];
  label: string;
}[] = [
  { value: "scheduled", label: "体験予約" },
  { value: "completed", label: "体験実施済" },
  { value: "canceled", label: "キャンセル" },
];

export function formatTrialSessionStatus(value?: string | null) {
  if (value === "no_show") return "キャンセル";
  return trialSessionStatusOptions.find((option) => option.value === value)?.label ?? "未設定";
}

export function trialSessionStatusBadgeColor(value?: string | null) {
  if (value === "completed") return "teal";
  if (value === "scheduled") return "blue";
  if (value === "no_show" || value === "canceled") return "gray";
  return "gray";
}
