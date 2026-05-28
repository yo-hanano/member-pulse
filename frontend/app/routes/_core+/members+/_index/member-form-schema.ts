import { z } from "zod";

import { requiredString } from "~/lib/zod-helpers";
import { memberStatusValues } from "~/routes/_core+/members+/_index/member-status";

const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "日付を入力してください" })
  .optional()
  .or(z.literal(""));

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { message: `${label}は${max}文字以内で入力してください` })
    .optional()
    .or(z.literal(""));

// 会員作成・編集フォームの共通バリデーション。
export const memberFormSchema = z.object({
  locationId: requiredString("拠点").max(21),
  leadId: optionalText(21, "リード"),
  name: requiredString("氏名"),
  status: z.enum(memberStatusValues),
  joinedAt: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "入会日を入力してください" }),
  resignedAt: optionalDate,
  resignationReasonCode: optionalText(40, "退会理由コード"),
  resignationNote: optionalText(1000, "退会理由メモ"),
  phone: optionalText(40, "電話番号"),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  lineDisplayName: optionalText(100, "LINE表示名"),
  address: optionalText(1000, "住所"),
  birthDate: optionalDate,
  source: optionalText(100, "流入元"),
  note: optionalText(1000, "メモ"),
});

export type MemberForm = z.infer<typeof memberFormSchema>;

// フォーム初期値（作成時のデフォルト値）。
export const emptyMemberForm: MemberForm = {
  locationId: "",
  leadId: "",
  name: "",
  status: "active",
  joinedAt: new Date().toISOString().slice(0, 10),
  resignedAt: "",
  resignationReasonCode: "",
  resignationNote: "",
  phone: "",
  email: "",
  lineDisplayName: "",
  address: "",
  birthDate: "",
  source: "",
  note: "",
};

// GraphQL input へ渡す前に空文字を nullable な値へ寄せる。
export const toMemberInput = (data: MemberForm) => ({
  locationId: data.locationId,
  leadId: data.leadId || undefined,
  name: data.name,
  status: data.status,
  joinedAt: data.joinedAt,
  resignedAt: data.resignedAt || undefined,
  resignationReasonCode: data.resignationReasonCode || undefined,
  resignationNote: data.resignationNote || undefined,
  phone: data.phone || undefined,
  email: data.email || undefined,
  lineDisplayName: data.lineDisplayName || undefined,
  address: data.address || undefined,
  birthDate: data.birthDate || undefined,
  source: data.source || undefined,
  note: data.note || undefined,
});
