import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Surface } from "@heroui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form as RouterForm, redirect, useActionData, useLoaderData, useNavigation, useSubmit } from "react-router";
import { z } from "zod";

import { FieldErrorText } from "~/components/form/field-error-text";
import { getSdk } from "~/generated/graphql";
import { requiredEmail } from "~/lib/zod-helpers";
import { getGraphQLClient } from "~/services/graphql-client";

const formSchema = z
  .object({
    name: z.string().trim().min(1, { message: "名前を入力してください" }),
    email: requiredEmail(),
    currentPassword: z.string().min(1, { message: "現在のパスワードを入力してください" }),
    newPassword: z.string().trim(),
    confirmNewPassword: z.string().trim(),
  })
  .superRefine((value, ctx) => {
    const hasNewPassword = value.newPassword.length > 0;
    const hasConfirm = value.confirmNewPassword.length > 0;

    // パスワード変更時の最低文字数を検証する。
    if (hasNewPassword && value.newPassword.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "新しいパスワードは8文字以上で入力してください",
      });
    }

    // 新旧パスワード入力欄の片側だけが埋まる状態を防ぐ。
    if (hasNewPassword !== hasConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [hasNewPassword ? "confirmNewPassword" : "newPassword"],
        message: "新しいパスワードと確認用パスワードを両方入力してください",
      });
    }

    // 新しいパスワードと確認用パスワードの一致を検証する。
    if (hasNewPassword && hasConfirm && value.newPassword !== value.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "新しいパスワードが一致しません",
      });
    }
  });

type FormSchema = z.infer<typeof formSchema>;

type LoaderData = {
  name: string;
  email: string;
};

type ActionData = {
  message: "ok" | "ng";
  error?: string[];
  values?: Record<string, FormDataEntryValue>;
  user?: {
    name: string;
    email: string;
  };
};

// 現在のログインユーザーのプロフィールを取得する。
export const clientLoader = async () => {
  const res = await fetch("/auth/me", { credentials: "include" });
  if (!res.ok) {
    throw redirect("/login");
  }
  const data = (await res.json()) as { name?: string; email?: string };
  return {
    name: data.name ?? "",
    email: data.email ?? "",
  } satisfies LoaderData;
};

// 現在のパスワード確認とアカウント更新をまとめて扱う。
export const clientAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData.entries());
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    return {
      message: "ng",
      error: parsed.error.issues.map((issue) => issue.message),
      values,
    } satisfies ActionData;
  }

  const { name, email, currentPassword, newPassword } = parsed.data;

  try {
    const verifyRes = await fetch("/auth/password/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword }),
    });
    const verifyPayload = (await verifyRes.json().catch(() => null)) as { error?: string } | null;

    if (!verifyRes.ok) {
      const fallbackMessage =
        verifyRes.status === 401 ? "現在のパスワードが正しくありません" : "パスワード検証に失敗しました";
      return {
        message: "ng",
        error: [verifyPayload?.error ?? fallbackMessage],
        values,
      } satisfies ActionData;
    }

    const client = getGraphQLClient();
    const sdk = getSdk(client);
    const result = await sdk.updateOwnAccount({
      input: {
        name,
        currentPassword,
        newPassword: newPassword.length > 0 ? newPassword : undefined,
      },
    });

    const user = result.updateOwnAccount;
    if (!user) {
      return {
        message: "ng",
        error: ["アカウント更新に失敗しました"],
        values,
      } satisfies ActionData;
    }

    return {
      message: "ok",
      user: {
        name: user.name ?? name,
        email: user.email ?? email,
      },
    } satisfies ActionData;
  } catch (error) {
    if (error instanceof Response) {
      const fallbackMessage =
        error.status === 401
          ? "現在のパスワードが正しくありません"
          : error.status === 400
            ? "入力内容を確認してください"
            : "アカウント更新に失敗しました";
      return {
        message: "ng",
        error: [fallbackMessage],
        values,
      } satisfies ActionData;
    }

    return {
      message: "ng",
      error: ["アカウント更新に失敗しました"],
      values,
    } satisfies ActionData;
  }
};

export function meta() {
  return [{ title: "アカウント設定" }, { name: "description", content: "アカウント設定" }];
}

// アカウント設定画面本体。基本情報更新とパスワード変更をまとめて扱う。
export default function AccountSettingsRoute() {
  const { name, email } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [savedProfile, setSavedProfile] = useState<LoaderData>({ name, email });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      name,
      email,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = form;

  const watchedName = form.watch("name");
  const watchedCurrentPassword = form.watch("currentPassword");
  const watchedNewPassword = form.watch("newPassword");
  const watchedConfirmNewPassword = form.watch("confirmNewPassword");
  const normalizedSavedName = savedProfile.name.trim();
  const normalizedCurrentName = watchedName.trim();

  // 名前変更かパスワード変更意図がある場合のみ保存を許可する。
  const hasProfileChanges = normalizedCurrentName !== normalizedSavedName;
  const hasPasswordChangeIntent =
    watchedNewPassword.trim().length > 0 || watchedConfirmNewPassword.trim().length > 0;
  const hasAnyChanges = hasProfileChanges || hasPasswordChangeIntent;
  const canSubmit = hasAnyChanges && watchedCurrentPassword.trim().length > 0;

  // 最初にエラーになった入力へフォーカスする。
  useEffect(() => {
    if (errors.name) setFocus("name");
    else if (errors.currentPassword) setFocus("currentPassword");
    else if (errors.newPassword) setFocus("newPassword");
    else if (errors.confirmNewPassword) setFocus("confirmNewPassword");
  }, [errors, setFocus]);

  // action 結果に応じてフォーム値と保存済みプロフィールを同期する。
  useEffect(() => {
    if (!actionData) return;
    if (actionData.message === "ok") {
      const nextName = actionData.user?.name ?? name;
      const nextEmail = actionData.user?.email ?? email;
      setSavedProfile({ name: nextName, email: nextEmail });
      reset({
        name: nextName,
        email: nextEmail,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      return;
    }

    if (actionData.values) {
      reset({
        name: typeof actionData.values.name === "string" ? actionData.values.name : name,
        email: typeof actionData.values.email === "string" ? actionData.values.email : email,
        currentPassword: typeof actionData.values.currentPassword === "string" ? actionData.values.currentPassword : "",
        newPassword: typeof actionData.values.newPassword === "string" ? actionData.values.newPassword : "",
        confirmNewPassword:
          typeof actionData.values.confirmNewPassword === "string" ? actionData.values.confirmNewPassword : "",
      });
    }
  }, [actionData, email, name, reset]);

  // loader の最新プロフィールを保存済み値として同期する。
  useEffect(() => {
    setSavedProfile({ name, email });
  }, [email, name]);

  // RHF で検証済みの値を Router action へ送信する。
  const onValid = (data: FormSchema) => {
    const fd = new FormData();
    fd.set("name", data.name);
    fd.set("email", data.email);
    fd.set("currentPassword", data.currentPassword);
    fd.set("newPassword", data.newPassword);
    fd.set("confirmNewPassword", data.confirmNewPassword);
    submit(fd, { method: "post", encType: "application/x-www-form-urlencoded" });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">アカウント設定</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">名前とパスワードを更新できます。変更内容を保存するには現在のパスワードが必要です。</p>
      </div>

      <RouterForm className="space-y-6" method="post" noValidate onSubmit={handleSubmit(onValid)}>
        <Surface className="space-y-5 rounded-2xl border border-border/60 bg-surface text-surface-foreground p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">基本情報</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">表示名を編集できます。メールアドレス（ログインID）は変更できません。</p>
          </div>

          <div className="grid gap-y-2 sm:grid-cols-[220px_minmax(0,420px)] sm:items-center sm:gap-x-8">
            <label className="text-sm font-medium text-foreground/88" htmlFor="name">
              名前
            </label>
            <div className="space-y-1">
              <Input className="w-full sm:w-[360px]" id="name" autoComplete="name" variant="secondary" {...register("name")} />
              <FieldErrorText message={errors.name?.message} />
            </div>
          </div>

          <div className="grid gap-y-2 sm:grid-cols-[220px_minmax(0,420px)] sm:items-center sm:gap-x-8">
            <label className="text-sm font-medium text-foreground/88" htmlFor="email">
              メールアドレス
            </label>
            <div className="space-y-1">
              <Input className="w-full sm:w-[360px]" id="email" autoComplete="email" disabled readOnly type="email" variant="secondary" {...register("email")} />
              <FieldErrorText message={errors.email?.message} />
            </div>
          </div>
        </Surface>

        <Surface className="space-y-5 rounded-2xl border border-border/60 bg-surface text-surface-foreground p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">パスワード</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">パスワードを変更する場合のみ、新しいパスワードを入力してください。</p>
          </div>

          <div className="grid gap-y-2 sm:grid-cols-[220px_minmax(0,420px)] sm:items-center sm:gap-x-8">
            <label className="text-sm font-medium text-foreground/88" htmlFor="newPassword">
              新しいパスワード
            </label>
            <div className="space-y-1">
              <Input className="w-full sm:w-[360px]" id="newPassword" autoComplete="new-password" type="password" variant="secondary" {...register("newPassword")} />
              <FieldErrorText message={errors.newPassword?.message} />
            </div>
          </div>

          <div className="grid gap-y-2 sm:grid-cols-[220px_minmax(0,420px)] sm:items-center sm:gap-x-8">
            <label className="text-sm font-medium text-foreground/88" htmlFor="confirmNewPassword">
              新しいパスワード（確認）
            </label>
            <div className="space-y-1">
              <Input
                className="w-full sm:w-[360px]"
                id="confirmNewPassword"
                autoComplete="new-password"
                type="password"
                variant="secondary"
                {...register("confirmNewPassword")}
              />
              <FieldErrorText message={errors.confirmNewPassword?.message} />
            </div>
          </div>
        </Surface>

        {actionData?.error?.length ? (
          <Surface className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {actionData.error.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </Surface>
        ) : null}

        {actionData?.message === "ok" ? (
          <Surface className="rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
            アカウント情報を更新しました。
          </Surface>
        ) : null}

        <Surface className="space-y-4 rounded-2xl border border-border/60 bg-surface p-6 shadow-sm">
          {hasAnyChanges ? (
            <div className="grid gap-y-2 sm:grid-cols-[260px_minmax(0,420px)] sm:items-center sm:gap-x-8">
              <label className="text-sm font-medium text-foreground/88" htmlFor="currentPassword">
                保存のため現在のパスワードを入力
              </label>
              <div className="space-y-1">
                <Input
                  className="w-full sm:w-[360px]"
                  id="currentPassword"
                  autoComplete="current-password"
                  placeholder="現在のパスワード"
                  type="password"
                  variant="secondary"
                  {...register("currentPassword")}
                />
                <FieldErrorText message={errors.currentPassword?.message} />
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm leading-relaxed">名前または新しいパスワードを変更すると保存できます。</p>
          )}

          <div className="flex justify-end">
            <Button className="app-primary-button" isDisabled={!canSubmit} isPending={isSubmitting} type="submit">
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </Surface>
      </RouterForm>
    </div>
  );
}
