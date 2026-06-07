export const subscriptionStatusValues = ["active", "paused", "ended"] as const;

export const subscriptionStatusOptions = [
  { value: "active", label: "契約中" },
  { value: "paused", label: "休会中" },
  { value: "ended", label: "終了" },
] as const;

// 契約ステータスを画面表示用の日本語へ変換する。
export const formatSubscriptionStatus = (status?: string | null) =>
  subscriptionStatusOptions.find((option) => option.value === status)?.label ?? status ?? "-";

// 契約ステータスごとの Badge 色を返す。会員ステータスの配色と揃える。
export const subscriptionStatusBadgeColor = (status?: string | null) => {
  switch (status) {
    case "active":
      return "teal";
    case "paused":
      return "yellow";
    case "ended":
      return "gray";
    default:
      return "gray";
  }
};
