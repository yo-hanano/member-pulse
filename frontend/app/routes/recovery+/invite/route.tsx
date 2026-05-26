import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Link } from "@heroui/react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Form as RouterForm,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "react-router";
import { z } from "zod";
import { requiredPassword } from "~/lib/zod-helpers";
import { cn } from "~/lib/utils";

const formSchema = z
  .object({
    password: requiredPassword("パスワード", "パスワードを入力してください", "パスワードは8文字以上で入力してください"),
    confirmPassword: requiredPassword(
      "確認用パスワード",
      "確認用パスワードを入力してください",
      "確認用パスワードは8文字以上で入力してください",
    ),
    token: z.string().min(1, "パスワード設定リンクがありません"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "パスワードが一致しません",
  });

type FormSchema = z.infer<typeof formSchema>;

type LoaderData = {
  token?: string;
  email?: string;
  expiresAt?: string;
  error?: string;
};

type ActionData = {
  message: "ok" | "ng";
  error?: string[];
};

// 招待URLトークンを検証し、対象ユーザー情報を取得する
export const clientLoader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  if (!token) {
    return { error: "パスワード設定リンクがありません" } satisfies LoaderData;
  }

  try {
    const res = await fetch("/auth/employee/invite/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      return { token, error: "無効なパスワード設定リンクです" } satisfies LoaderData;
    }

    const json = (await res.json()) as { email?: string; expiresAt?: string };
    return {
      token,
      email: json.email,
      expiresAt: json.expiresAt,
    } satisfies LoaderData;
  } catch {
    return {
      token,
      error: "パスワード設定リンクの検証に失敗しました",
    } satisfies LoaderData;
  }
};

// 招待ユーザーの初回パスワード設定を完了する
export const clientAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData.entries());
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    return {
      message: "ng",
      error: parsed.error.issues.map((issue) => issue.message),
    } satisfies ActionData;
  }

  const { password, token } = parsed.data;

  try {
    const res = await fetch("/auth/employee/invite/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    if (!res.ok) {
      return { message: "ng", error: ["パスワード設定に失敗しました"] } satisfies ActionData;
    }

    return { message: "ok" } satisfies ActionData;
  } catch {
    return { message: "ng", error: ["パスワード設定に失敗しました"] } satisfies ActionData;
  }
};

export function meta() {
  return [{ title: "パスワード設定" }, { name: "description", content: "従業員パスワード設定" }];
}

export default function EmployeeInviteRoute() {
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  const isSubmitting = navigation.state === "submitting";
  const submitLockRef = useRef(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: loaderData.token ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = form;

  // 入力エラーの先頭フィールドへフォーカスする
  useEffect(() => {
    if (errors.password) setFocus("password");
    else if (errors.confirmPassword) setFocus("confirmPassword");
  }, [errors, setFocus]);

  // 送信状態が戻ったら再送信ロックを解除する
  useEffect(() => {
    if (!isSubmitting) submitLockRef.current = false;
  }, [isSubmitting]);

  // 成功時はログイン画面へ遷移する
  useEffect(() => {
    if (actionData?.message === "ok") {
      navigate("/login");
    }
  }, [actionData?.message, navigate]);

  // バリデーション済みデータのみ action へ送信する
  const onValid = (data: FormSchema) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    const fd = new FormData();
    fd.set("password", data.password);
    fd.set("confirmPassword", data.confirmPassword);
    fd.set("token", data.token);

    submit(fd, {
      method: "post",
      encType: "application/x-www-form-urlencoded",
    });
  };

  return (
    <div className="min-h-svh bg-default-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-surface">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">パスワード設定</h1>
          <p className="text-muted-foreground text-sm">
            パスワード設定リンクからアクセスしたアカウントのパスワードを設定してください
          </p>
        </div>

        {loaderData.error ? (
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            {loaderData.error}
          </div>
        ) : (
          <RouterForm
            className={cn("flex flex-col gap-6")}
            method="post"
            noValidate
            onSubmit={handleSubmit(onValid)}
          >
            <input type="hidden" name="token" value={loaderData.token ?? ""} />

            <div className="grid gap-2 text-sm text-muted-foreground">
              <div>
                対象アカウント: <span className="font-medium text-foreground">{loaderData.email}</span>
              </div>
              {loaderData.expiresAt ? <div>有効期限: {new Date(loaderData.expiresAt).toLocaleString()}</div> : null}
            </div>

            <div className="grid gap-4">
              <label className="grid gap-3">
                <span className="text-sm font-medium">パスワード</span>
                <Input
                   {...register("password")}
                  autoComplete="new-password"
                  aria-label="パスワード"
                  placeholder="••••••••"
                  type="password"
                  variant="secondary"
                />
                {errors.password ? <span className="text-sm text-danger">{errors.password.message}</span> : null}
              </label>

              <label className="grid gap-3">
                <span className="text-sm font-medium">パスワード（確認）</span>
                <Input
                   {...register("confirmPassword")}
                  autoComplete="new-password"
                  aria-label="パスワード（確認）"
                  placeholder="••••••••"
                  type="password"
                  variant="secondary"
                />
                {errors.confirmPassword ? (
                  <span className="text-sm text-danger">{errors.confirmPassword.message}</span>
                ) : null}
              </label>
            </div>

            {actionData?.error?.length ? (
              <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                {actionData.error.map((msg, index) => (
                  <p key={index}>{msg}</p>
                ))}
              </div>
            ) : null}

            <Button fullWidth isPending={isSubmitting} type="submit">
              {isSubmitting ? "処理中..." : "パスワードを設定する"}
            </Button>

            <div className="text-center text-sm">
              <Link className="underline underline-offset-4" href="/login">
                ログイン画面へ
              </Link>
            </div>
          </RouterForm>
        )}
      </div>
    </div>
  );
}
