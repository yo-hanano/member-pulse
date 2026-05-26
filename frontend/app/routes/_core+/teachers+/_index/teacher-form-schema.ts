import { z } from "zod";

import { optionalDateString, requiredString } from "~/lib/zod-helpers";

const teacherStatusSchema = z.enum(["active", "inactive"]);

// 講師作成・編集フォームの共通バリデーション。
export const teacherFormSchema = z.object({
  code: requiredString("講師NO"),
  name: requiredString("名前"),
  kana: requiredString("フリガナ"),
  birthday: optionalDateString(),
  genderCode: requiredString("性別"),
  schoolCode: requiredString("所属学校"),
  schoolGradeCode: requiredString("学年"),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  status: teacherStatusSchema,
  note: z.string().max(1000).optional().or(z.literal("")),
});

export type TeacherForm = z.infer<typeof teacherFormSchema>;

// フォーム初期値（作成時のデフォルト値）。
export const emptyTeacherForm: TeacherForm = {
  code: "",
  name: "",
  kana: "",
  birthday: "",
  genderCode: "not_specified",
  schoolCode: "",
  schoolGradeCode: "",
  phone: "",
  email: "",
  status: "active",
  note: "",
};
