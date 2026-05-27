import { Alert, Anchor, Button, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { useEffect, useRef } from "react";
import {
  Link,
  Form as RouterForm,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "react-router";
import { z } from "zod";

import { requiredPassword } from "~/lib/zod-helpers";

const formSchema = z
  .object({
    password: requiredPassword(
      "パスワード",
      "パスワードを入力してください",
      "パスワードは8文字以上で入力してください",
    ),
    confirmPassword: requiredPassword(
      "確認用パスワード",
      "確認用パスワードを入力してください",
      "確認用パスワードは8文字以上で入力してください",
    ),
    token: z.string().min(1, "リセットトークンがありません"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "パスワードが一致しません",
  });

type FormSchema = z.infer<typeof formSchema>;

type LoaderData = {
  token?: string;
  error?: string;
};

type ActionData = {
  message: "ok" | "ng";
  error?: string[];
};

// URLクエリからリセットトークンを受け取り、フォーム初期値に渡す
export const clientLoader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  if (!token) {
    return { error: "リセットトークンがありません" } satisfies LoaderData;
  }
  return { token } satisfies LoaderData;
};

// 新しいパスワードをBFF経由でバックエンドに反映する
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
    const res = await fetch("/auth/password/reset/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    if (!res.ok) {
      return {
        message: "ng",
        error: ["パスワードの再設定に失敗しました"],
      } satisfies ActionData;
    }

    return { message: "ok" } satisfies ActionData;
  } catch {
    return {
      message: "ng",
      error: ["パスワードの再設定に失敗しました"],
    } satisfies ActionData;
  }
};

export function meta() {
  return [{ title: "パスワード再設定" }, { name: "description", content: "パスワード再設定" }];
}

export default function PasswordResetRoute() {
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  const isSubmitting = navigation.state === "submitting";
  const submitLockRef = useRef(false);

  const form = useForm<FormSchema>({
    mode: "uncontrolled",
    initialValues: {
      password: "",
      confirmPassword: "",
      token: loaderData.token ?? "",
    },
    validate: schemaResolver(formSchema, { sync: true }),
  });

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

  const handleSubmit = form.onSubmit((data) => {
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
  });

  return (
    <Stack className="mx-auto w-full max-w-md px-4 py-10" gap="lg">
      <Stack gap={6} ta="center">
        <Title order={1} size="h2">
          パスワード再設定
        </Title>
        <Text c="dimmed" size="sm">
          新しいパスワードを設定してください
        </Text>
      </Stack>

      {loaderData.error ? (
        <Alert color="red" variant="light">
          {loaderData.error}
        </Alert>
      ) : (
        <RouterForm method="post" noValidate onSubmit={handleSubmit}>
          <Stack gap="md">
            <input type="hidden" name="token" value={loaderData.token ?? ""} />

            <PasswordInput
              key={form.key("password")}
              {...form.getInputProps("password")}
              autoComplete="new-password"
              label="パスワード"
              placeholder="パスワード"
            />
            <PasswordInput
              key={form.key("confirmPassword")}
              {...form.getInputProps("confirmPassword")}
              autoComplete="new-password"
              label="パスワード（確認）"
              placeholder="パスワード（確認）"
            />

            {actionData?.error?.length ? (
              <Alert color="red" variant="light">
                {actionData.error.map((msg) => (
                  <Text key={msg} size="sm">
                    {msg}
                  </Text>
                ))}
              </Alert>
            ) : null}

            <Button fullWidth loading={isSubmitting} type="submit">
              パスワードを設定する
            </Button>

            <Text size="sm" ta="center">
              <Anchor component={Link} to="/login">
                ログイン画面へ
              </Anchor>
            </Text>
          </Stack>
        </RouterForm>
      )}
    </Stack>
  );
}
