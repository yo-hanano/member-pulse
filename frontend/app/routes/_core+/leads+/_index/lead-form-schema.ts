import { z } from "zod";

import { toDateTimeLocalValue } from "~/lib/date";
import { requiredString } from "~/lib/zod-helpers";
import { leadStatusValues } from "~/routes/_core+/leads+/_index/lead-status";

// リード作成・編集フォームの共通バリデーション。
export const leadFormSchema = z
  .object({
    inquiryAt: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { message: "問合せ日を入力してください" }),
    branchId: requiredString("拠点"),
    studentName: requiredString("生徒名"),
    studentKana: z.string().max(100).optional().or(z.literal("")),
    guardianName: z.string().max(100).optional().or(z.literal("")),
    guardianKana: z.string().max(100).optional().or(z.literal("")),
    schoolName: z.string().max(120).optional().or(z.literal("")),
    gradeName: z.string().max(40).optional().or(z.literal("")),
    phone: z.string().max(20).optional().or(z.literal("")),
    email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
    channel: z.string().max(40).optional().or(z.literal("")),
    status: z.enum(leadStatusValues),
    note: z.string().max(1000).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    // DB の連絡先必須制約に合わせて、電話番号かメールアドレスのどちらかを必須にする。
    if (!value.phone?.trim() && !value.email?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "電話番号かメールアドレスを入力してください",
      });
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "電話番号かメールアドレスを入力してください",
      });
    }
  });

export type LeadForm = z.infer<typeof leadFormSchema>;

// フォーム初期値（作成時のデフォルト値）。
export const emptyLeadForm: LeadForm = {
  inquiryAt: toDateTimeLocalValue(new Date()),
  branchId: "",
  studentName: "",
  studentKana: "",
  guardianName: "",
  guardianKana: "",
  schoolName: "",
  gradeName: "",
  phone: "",
  email: "",
  channel: "",
  status: "new",
  note: "",
};
