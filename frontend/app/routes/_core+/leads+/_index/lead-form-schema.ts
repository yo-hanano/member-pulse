import { z } from "zod";

import { toDateTimeLocalValue } from "~/lib/date";
import { requiredString } from "~/lib/zod-helpers";
import { leadStatusValues } from "~/routes/_core+/leads+/_index/lead-status";

const optionalDateTime = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { message: "日時を入力してください" })
  .optional()
  .or(z.literal(""));

// リード作成・編集フォームの共通バリデーション。
export const leadFormSchema = z.object({
  inquiryAt: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { message: "問合せ日を入力してください" }),
  locationId: z.string().max(21).optional().or(z.literal("")),
  name: requiredString("氏名"),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  source: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(leadStatusValues),
  lostAt: optionalDateTime,
  lostReason: z.string().max(1000).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
});

export type LeadForm = z.infer<typeof leadFormSchema>;

// フォーム初期値（作成時のデフォルト値）。
export const emptyLeadForm: LeadForm = {
  inquiryAt: toDateTimeLocalValue(new Date()),
  locationId: "",
  name: "",
  phone: "",
  email: "",
  source: "",
  status: "new",
  lostAt: "",
  lostReason: "",
  note: "",
};

export const toLeadInput = (data: LeadForm) => ({
  inquiryAt: data.inquiryAt,
  locationId: data.locationId || undefined,
  name: data.name,
  phone: data.phone || undefined,
  email: data.email || undefined,
  source: data.source || undefined,
  status: data.status,
  lostAt: data.lostAt || undefined,
  lostReason: data.lostReason || undefined,
  note: data.note || undefined,
});
