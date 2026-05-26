import { z } from "zod";

import { requiredEmail, requiredString } from "~/lib/zod-helpers";

// 従業員作成・編集フォームの共通バリデーション。
export const employeeFormSchema = z.object({
  name: requiredString("氏名"),
  email: requiredEmail(),
  genderCode: requiredString("性別"),
  isAdmin: z.boolean(),
});

export type EmployeeForm = z.infer<typeof employeeFormSchema>;

// フォーム初期値（作成時のデフォルト値）。
export const emptyEmployeeForm: EmployeeForm = {
  name: "",
  email: "",
  genderCode: "not_specified",
  isAdmin: false,
};
