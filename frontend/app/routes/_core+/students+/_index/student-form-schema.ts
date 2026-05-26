import { z } from "zod";

import { requiredDateString, requiredString } from "~/lib/zod-helpers";

const studentStatusSchema = z.enum(["active", "inactive"]);

export const guardianFormSchema = z.object({
  id: z.string().max(21).optional().or(z.literal("")),
  name: requiredString("保護者名").max(100),
  kana: requiredString("保護者フリガナ").max(100),
  relationshipCode: requiredString("続柄"),
  prefectureCode: requiredString("都道府県"),
  phone: requiredString("電話番号").max(20),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  postalCode: requiredString("郵便番号")
    .trim()
    .regex(/^\d{3}-?\d{4}$/, {
      message: "郵便番号は xxx-xxxx または xxxxxxx の形式で入力してください",
    }),
  address: requiredString("住所").max(255),
  note: z.string().max(1000).optional().or(z.literal("")),
});

export const billingContactFormSchema = z.object({
  id: z.string().max(21).optional().or(z.literal("")),
  name: requiredString("請求先名").max(100),
  kana: requiredString("請求先フリガナ").max(100),
  prefectureCode: requiredString("都道府県"),
  phone: requiredString("電話番号").max(20),
  email: requiredString("請求先メールアドレス").email("有効なメールアドレスを入力してください"),
  postalCode: requiredString("郵便番号")
    .trim()
    .regex(/^\d{3}-?\d{4}$/, {
      message: "郵便番号は xxx-xxxx または xxxxxxx の形式で入力してください",
    }),
  address: requiredString("住所").max(255),
  note: z.string().max(1000).optional().or(z.literal("")),
});

// 生徒基本情報フォームの共通バリデーション。
export const studentBaseFormSchema = z.object({
  code: requiredString("生徒NO"),
  name: requiredString("名前"),
  kana: requiredString("フリガナ"),
  birthday: requiredDateString("誕生日"),
  genderCode: requiredString("性別"),
  branchId: requiredString("所属拠点"),
  schoolCode: requiredString("所属学校"),
  schoolGradeCode: requiredString("学年"),
  status: studentStatusSchema,
  note: z.string().max(1000).optional().or(z.literal("")),
});

// 生徒作成・関連情報フォームの共通バリデーション。
export const studentFormSchema = studentBaseFormSchema.extend({
  guardian: guardianFormSchema,
});

export type StudentBaseForm = z.infer<typeof studentBaseFormSchema>;
export type StudentForm = z.infer<typeof studentFormSchema>;

// 保護者情報だけを更新するフォームのバリデーション。
export const studentGuardianFormSchema = z.object({
  guardian: guardianFormSchema,
});

export type StudentGuardianForm = z.infer<typeof studentGuardianFormSchema>;

// 請求先情報だけを更新するフォームのバリデーション。
export const studentBillingContactFormSchema = z.object({
  billingContact: billingContactFormSchema,
});

export type StudentBillingContactForm = z.infer<typeof studentBillingContactFormSchema>;

// 生徒基本情報フォーム初期値。
export const emptyStudentBaseForm: StudentBaseForm = {
  code: "",
  name: "",
  kana: "",
  birthday: "",
  genderCode: "not_specified",
  branchId: "",
  schoolCode: "",
  schoolGradeCode: "",
  status: "active",
  note: "",
};

// フォーム初期値（作成時のデフォルト値）。
export const emptyStudentForm: StudentForm = {
  ...emptyStudentBaseForm,
  guardian: {
    id: "",
    name: "",
    kana: "",
    relationshipCode: "",
    prefectureCode: "",
    phone: "",
    email: "",
    postalCode: "",
    address: "",
    note: "",
  },
};
