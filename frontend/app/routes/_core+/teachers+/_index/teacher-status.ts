export const teacherStatusOptions = [
  { value: "active", label: "在籍中" },
  { value: "inactive", label: "退会" },
] as const;

// ステータス値を画面表示用ラベルへ変換します。
export function teacherStatusLabel(status: string | null | undefined) {
  return teacherStatusOptions.find((option) => option.value === status)?.label ?? status ?? "-";
}
