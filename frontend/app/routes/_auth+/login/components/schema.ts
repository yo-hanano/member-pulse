import { z } from "zod";

export const loginSchema = z.object({
  companyCode: z.string().trim().min(1, { message: "企業コードを入力してください" }),
  email: z.string().trim().email({ message: "有効なメールアドレスを入力してください" }),
  password: z.string().min(6, { message: "パスワードは6文字以上で入力してください" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
