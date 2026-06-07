export const revenueTypeValues = ["membership_fee", "enrollment_fee", "goods", "other"] as const;

export const revenueTypeOptions = [
  { value: "membership_fee", label: "月謝" },
  { value: "enrollment_fee", label: "入会金" },
  { value: "goods", label: "物販" },
  { value: "other", label: "その他" },
] as const;

// 売上種別を画面表示用の日本語へ変換する。
export const formatRevenueType = (revenueType?: string | null) =>
  revenueTypeOptions.find((option) => option.value === revenueType)?.label ?? revenueType ?? "-";

// 売上種別ごとの Badge 色を返す。月謝（主収益）を基調色にする。
export const revenueTypeBadgeColor = (revenueType?: string | null) => {
  switch (revenueType) {
    case "membership_fee":
      return "teal";
    case "enrollment_fee":
      return "blue";
    case "goods":
      return "grape";
    case "other":
      return "gray";
    default:
      return "gray";
  }
};

// 入力元（自動生成/手入力）を画面表示用の日本語へ変換する。
export const formatRevenueSourceType = (sourceType?: string | null) =>
  sourceType === "auto" ? "自動" : "手入力";
