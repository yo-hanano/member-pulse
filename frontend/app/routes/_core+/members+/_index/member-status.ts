export const memberStatusValues = ["active", "paused", "resigned"] as const;

export const memberStatusOptions = [
  { value: "active", label: "在籍" },
  { value: "paused", label: "休会" },
  { value: "resigned", label: "退会" },
] as const;

// 会員ステータスを画面表示用の日本語へ変換する。
export const formatMemberStatus = (status?: string | null) =>
  memberStatusOptions.find((option) => option.value === status)?.label ?? status ?? "-";

// 会員ステータスごとの Badge 色を返す。
export const memberStatusBadgeColor = (status?: string | null) => {
  switch (status) {
    case "active":
      return "teal";
    case "paused":
      return "yellow";
    case "resigned":
      return "gray";
    default:
      return "gray";
  }
};
