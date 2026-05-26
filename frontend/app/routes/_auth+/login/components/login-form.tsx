import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Link } from "@heroui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form as RouterForm, useActionData, useNavigation, useSubmit } from "react-router";
import { cn } from "~/lib/utils";
import type { clientAction } from "../route";
import { loginSchema, type LoginSchema } from "./schema";

type LoginFormProps = {
  className?: string;
};

export function LoginForm({ className }: LoginFormProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData = useActionData<typeof clientAction>();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      companyCode: "",
      email: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!actionData?.values) return;
    reset({
      companyCode: actionData.values.companyCode ? String(actionData.values.companyCode) : "",
      email: actionData.values.email ? String(actionData.values.email) : "",
      password: actionData.values.password ? String(actionData.values.password) : "",
    });
  }, [actionData?.values, reset]);

  useEffect(() => {
    if (errors.companyCode) setFocus("companyCode");
    else if (errors.email) setFocus("email");
    else if (errors.password) setFocus("password");
  }, [errors, setFocus]);

  const onValid = (data: LoginSchema) => {
    const fd = new FormData();
    fd.set("companyCode", data.companyCode);
    fd.set("email", data.email);
    fd.set("password", data.password);
    submit(fd, {
      method: "post",
      encType: "application/x-www-form-urlencoded",
    });
  };

  return (
    <RouterForm
      className={cn("flex flex-col gap-6", className)}
      method="post"
      noValidate
      onSubmit={handleSubmit(onValid)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">ログイン</h1>
        <p className="text-muted-foreground text-sm text-balance">
          企業コード・メールアドレス・パスワードを入力してください
        </p>
      </div>

      <div className="grid gap-6">
        <label className="grid gap-3">
          <span className="text-sm font-medium">企業コード</span>
          <Input
            {...register("companyCode")}
            autoComplete="organization"
            aria-label="企業コード"
            placeholder="例: dev"
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
            placeholder="name@example.com"
            type="email"
            variant="secondary"
          />
          {errors.email ? <span className="text-sm text-danger">{errors.email.message}</span> : null}
        </label>

        <label className="grid gap-3">
          <div className="flex items-center">
            <span className="text-sm font-medium">パスワード</span>
            <Link className="ml-auto text-sm underline-offset-4 hover:underline" href="/password/reset">
              パスワードをお忘れですか？
            </Link>
          </div>
          <Input
            {...register("password")}
            autoComplete="current-password"
            aria-label="パスワード"
            placeholder="••••••••"
            type="password"
            variant="secondary"
          />
          {errors.password ? <span className="text-sm text-danger">{errors.password.message}</span> : null}
        </label>

        {actionData?.error?.length ? (
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            {actionData.error.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        ) : null}

        <Button fullWidth isPending={isSubmitting} type="submit">
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="bg-background text-muted-foreground relative z-10 px-2">または</span>
        </div>

        <Button fullWidth type="button" variant="outline">
          GitHubでログイン
        </Button>

        <div className="text-center text-sm">
          アカウントをお持ちでない方は{" "}
          <Link className="underline underline-offset-4" href="#">
            新規登録
          </Link>
        </div>
      </div>
    </RouterForm>
  );
}
