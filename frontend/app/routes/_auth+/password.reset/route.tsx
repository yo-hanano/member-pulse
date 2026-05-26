import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Link, Surface } from "@heroui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form as RouterForm, useActionData, useNavigation, useSubmit } from "react-router";
import { z } from "zod";
import { requiredEmail, requiredString } from "~/lib/zod-helpers";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  companyCode: requiredString("企業コード"),
  email: requiredEmail(),
});

type FormSchema = z.infer<typeof formSchema>;

type ActionData = {
  message: "ok" | "ng";
  error?: string[];
};

// パスワード再設定リンク送信をBFFへ委譲する
export const clientAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData.entries());
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    return { message: "ng", error: parsed.error.issues.map((issue) => issue.message) } satisfies ActionData;
  }

  const { companyCode, email } = parsed.data;

  try {
    const res = await fetch("/auth/password/reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyCode, email }),
    });

    if (!res.ok) {
      const message = res.status === 429 ? "リクエストが多すぎます" : "送信に失敗しました";
      return { message: "ng", error: [message] } satisfies ActionData;
    }

    return { message: "ok" } satisfies ActionData;
  } catch {
    return { message: "ng", error: ["送信に失敗しました"] } satisfies ActionData;
  }
};

export function meta() {
  return [{ title: "パスワード再設定" }, { name: "description", content: "パスワード再設定" }];
}

export default function PasswordResetRequestRoute() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<typeof clientAction>();
  const isSubmitting = navigation.state === "submitting";

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      companyCode: "",
      email: "",
    },
  });

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = form;

  // 最初のエラーフィールドへフォーカスする
  useEffect(() => {
    if (errors.companyCode) setFocus("companyCode");
    else if (errors.email) setFocus("email");
  }, [errors, setFocus]);

  // バリデーション済みの値だけ action に送る
  const onValid = (data: FormSchema) => {
    const fd = new FormData();
    fd.set("companyCode", data.companyCode);
    fd.set("email", data.email);
    submit(fd, {
      method: "post",
      encType: "application/x-www-form-urlencoded",
    });
  };

  return (
    <RouterForm
      className={cn("flex flex-col gap-6")}
      method="post"
      noValidate
      onSubmit={handleSubmit(onValid)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">パスワード再設定</h1>
        <p className="text-muted-foreground text-sm text-balance">
          登録済みのメールアドレスに再設定用リンクを送信します
        </p>
      </div>

      <div className="grid gap-6">
        <label className="grid gap-3">
          <span className="text-sm font-medium">企業コード</span>
          <Input
            {...register("companyCode")}
            autoComplete="organization"
            aria-label="企業コード"
            placeholder="company-code"
            variant="secondary"
          />
          {errors.companyCode ? <span className="text-sm text-danger">{errors.companyCode.message}</span> : null}
        </label>

        <label className="grid gap-3">
          <span className="text-sm font-medium">メールアドレス</span>
          <Input
            {...register("email")}
            autoComplete="email"
            aria-label="メールアドレス"
            placeholder="m@example.com"
            type="email"
            variant="secondary"
          />
          {errors.email ? <span className="text-sm text-danger">{errors.email.message}</span> : null}
        </label>

        {actionData?.error?.length ? (
          <Surface className="rounded-xl px-3 py-2 text-sm text-danger" variant="secondary">
            {actionData.error.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </Surface>
        ) : null}

        {actionData?.message === "ok" ? (
          <Surface className="rounded-xl px-4 py-3 text-[13px] leading-relaxed text-foreground" variant="secondary">
            再設定メールを送信しました。メール内のリンクからパスワードを再設定してください。
          </Surface>
        ) : null}

        <Button fullWidth isPending={isSubmitting} type="submit">
          {isSubmitting ? "送信中..." : "再設定リンクを送信"}
        </Button>
      </div>

      <div className="text-center text-sm">
        <Link className="underline underline-offset-4" href="/login">
          ログイン画面へ
        </Link>
      </div>
    </RouterForm>
  );
}
