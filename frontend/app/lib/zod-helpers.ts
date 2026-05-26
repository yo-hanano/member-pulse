import { z } from "zod";

/**
 * 必須文字列フィールド
 * .trim() と .min(1) を自動適用
 */
export function requiredString(fieldLabel: string) {
  return z
    .string(`${fieldLabel}を入力してください`)
    .trim()
    .min(1, { message: `${fieldLabel}を入力してください` });
}

/**
 * 必須メールフィールド
 * メール形式検証 + 必須チェック
 */
export function requiredEmail() {
  return z
    .email({ message: "有効なメールアドレスを入力してください" })
    .trim()
    .min(1, { message: "メールアドレスを入力してください" });
}

/**
 * オプショナル整数フィールド
 */
export function optionalInt() {
  return z.number().int().optional();
}

/**
 * 郵便番号フィールド
 * xxx-xxxx または xxxxxxx の形式を検証
 */
export function zipCode() {
  return z
    .string("郵便番号を入力してください")
    .trim()
    .min(1, { message: "郵便番号を入力してください" })
    .regex(/^\d{3}-?\d{4}$/, { message: "郵便番号は xxx-xxxx または xxxxxxx の形式で入力してください" });
}

/**
 * オプショナル日付フィールド（YYYY-MM-DD）
 */
export function optionalDateString() {
  return z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "日付は YYYY-MM-DD の形式で入力してください" })
    .optional()
    .or(z.literal(""));
}

/**
 * 必須日付フィールド（YYYY-MM-DD）
 */
export function requiredDateString(fieldLabel: string) {
  return z
    .string(`${fieldLabel}を入力してください`)
    .trim()
    .min(1, { message: `${fieldLabel}を入力してください` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "日付は YYYY-MM-DD の形式で入力してください" });
}

/**
 * オプショナルなローカルDateTime文字列
 * - yyyy-MM-dd -> yyyy-MM-ddT{現在時刻}
 * - yyyy-MM-ddTHH:mm -> yyyy-MM-ddTHH:mm:00
 */
export function optionalLocalDateTimeWithSystemTime() {
  return z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (trimmed.length === 10) {
      const now = new Date();
      const pad2 = (n: number) => String(n).padStart(2, "0");
      const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
      return `${trimmed}T${time}`;
    }
    if (trimmed.length === 16) {
      return `${trimmed}:00`;
    }
    return trimmed;
  }, z.string().optional());
}

/**
 * 必須なローカルDateTime文字列
 * - yyyy-MM-dd -> yyyy-MM-ddT{現在時刻}
 * - yyyy-MM-ddTHH:mm -> yyyy-MM-ddTHH:mm:00
 */
export function requiredLocalDateTimeWithSystemTime(fieldLabel: string) {
  return z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (!trimmed) return trimmed;
    if (trimmed.length === 10) {
      const now = new Date();
      const pad2 = (n: number) => String(n).padStart(2, "0");
      const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
      return `${trimmed}T${time}`;
    }
    if (trimmed.length === 16) {
      return `${trimmed}:00`;
    }
    return trimmed;
  }, z.string().trim().min(1, { message: `${fieldLabel}を入力してください` }));
}

/**
 * 必須パスワードフィールド
 * 必須 + 最小文字数(8)を検証
 */
export function requiredPassword(
  fieldLabel: string,
  emptyMessage?: string,
  minLengthMessage?: string,
) {
  const required = emptyMessage ?? `${fieldLabel}を入力してください`;
  const min8 = minLengthMessage ?? `${fieldLabel}は8文字以上で入力してください`;

  return z
    .string(required)
    .trim()
    .min(1, { message: required })
    .min(8, { message: min8 });
}
