import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import {
  Form as RouterForm,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import { z } from "zod";

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
        verifyRes.status === 401
          ? "現在のパスワードが正しくありません"
          : "パスワード検証に失敗しました";
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
    mode: "uncontrolled",
    initialValues: {
      name,
      email,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validate: schemaResolver(formSchema, { sync: true }),
  });

  const values = form.getValues();
  const normalizedSavedName = savedProfile.name.trim();
  const normalizedCurrentName = values.name.trim();

  // 名前変更かパスワード変更意図がある場合のみ保存を許可する。
  const hasProfileChanges = normalizedCurrentName !== normalizedSavedName;
  const hasPasswordChangeIntent =
    values.newPassword.trim().length > 0 || values.confirmNewPassword.trim().length > 0;
  const hasAnyChanges = hasProfileChanges || hasPasswordChangeIntent;
  const canSubmit = hasAnyChanges && values.currentPassword.trim().length > 0;

  // action 結果に応じてフォーム値と保存済みプロフィールを同期する。
  useEffect(() => {
    if (!actionData) return;
    if (actionData.message === "ok") {
      const nextName = actionData.user?.name ?? name;
      const nextEmail = actionData.user?.email ?? email;
      setSavedProfile({ name: nextName, email: nextEmail });
      form.setValues({
        name: nextName,
        email: nextEmail,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      return;
    }

    if (actionData.values) {
      form.setValues({
        name: typeof actionData.values.name === "string" ? actionData.values.name : name,
        email: typeof actionData.values.email === "string" ? actionData.values.email : email,
        currentPassword:
          typeof actionData.values.currentPassword === "string"
            ? actionData.values.currentPassword
            : "",
        newPassword:
          typeof actionData.values.newPassword === "string" ? actionData.values.newPassword : "",
        confirmNewPassword:
          typeof actionData.values.confirmNewPassword === "string"
            ? actionData.values.confirmNewPassword
            : "",
      });
    }
  }, [actionData, email, form.setValues, name]);

  // loader の最新プロフィールを保存済み値として同期する。
  useEffect(() => {
    setSavedProfile({ name, email });
  }, [email, name]);

  const handleSubmit = form.onSubmit((data) => {
    const fd = new FormData();
    fd.set("name", data.name);
    fd.set("email", data.email);
    fd.set("currentPassword", data.currentPassword);
    fd.set("newPassword", data.newPassword);
    fd.set("confirmNewPassword", data.confirmNewPassword);
    submit(fd, { method: "post", encType: "application/x-www-form-urlencoded" });
  });

  return (
    <Stack maw={860} gap="lg">
      <Stack gap={4}>
        <Title order={1}>アカウント設定</Title>
        <Text c="dimmed" size="sm">
          名前とパスワードを更新できます。変更内容を保存するには現在のパスワードが必要です。
        </Text>
      </Stack>

      <RouterForm method="post" noValidate onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Paper p="lg" radius="sm" shadow="xs" withBorder>
            <Stack gap="md">
              <Stack gap={4}>
                <Title order={2} size="h4">
                  基本情報
                </Title>
                <Text c="dimmed" size="sm">
                  表示名を編集できます。メールアドレス（ログインID）は変更できません。
                </Text>
              </Stack>
              <TextInput
                key={form.key("name")}
                {...form.getInputProps("name")}
                autoComplete="name"
                label="名前"
                maw={420}
              />
              <TextInput
                key={form.key("email")}
                {...form.getInputProps("email")}
                autoComplete="email"
                disabled
                label="メールアドレス"
                maw={420}
                readOnly
                type="email"
              />
            </Stack>
          </Paper>

          <Paper p="lg" radius="sm" shadow="xs" withBorder>
            <Stack gap="md">
              <Stack gap={4}>
                <Title order={2} size="h4">
                  パスワード
                </Title>
                <Text c="dimmed" size="sm">
                  パスワードを変更する場合のみ、新しいパスワードを入力してください。
                </Text>
              </Stack>
              <PasswordInput
                key={form.key("newPassword")}
                {...form.getInputProps("newPassword")}
                autoComplete="new-password"
                label="新しいパスワード"
                maw={420}
              />
              <PasswordInput
                key={form.key("confirmNewPassword")}
                {...form.getInputProps("confirmNewPassword")}
                autoComplete="new-password"
                label="新しいパスワード（確認）"
                maw={420}
              />
            </Stack>
          </Paper>

          {actionData?.error?.length ? (
            <Alert color="red" variant="light">
              {actionData.error.map((msg) => (
                <Text key={msg} size="sm">
                  {msg}
                </Text>
              ))}
            </Alert>
          ) : null}

          {actionData?.message === "ok" ? (
            <Alert color="teal" variant="light">
              アカウント情報を更新しました。
            </Alert>
          ) : null}

          <Paper p="lg" radius="sm" shadow="xs" withBorder>
            <Stack gap="md">
              {hasAnyChanges ? (
                <PasswordInput
                  key={form.key("currentPassword")}
                  {...form.getInputProps("currentPassword")}
                  autoComplete="current-password"
                  label="保存のため現在のパスワードを入力"
                  maw={420}
                  placeholder="現在のパスワード"
                />
              ) : (
                <Text c="dimmed" size="sm">
                  名前または新しいパスワードを変更すると保存できます。
                </Text>
              )}

              <Button disabled={!canSubmit} loading={isSubmitting} ml="auto" type="submit">
                保存
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </RouterForm>
    </Stack>
  );
}
