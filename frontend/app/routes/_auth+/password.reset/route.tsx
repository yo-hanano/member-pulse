import { Alert, Anchor, Button, Stack, Text, TextInput, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { Link, Form as RouterForm, useActionData, useNavigation, useSubmit } from "react-router";
import { z } from "zod";

import { requiredEmail, requiredString } from "~/lib/zod-helpers";

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
    return {
      message: "ng",
      error: parsed.error.issues.map((issue) => issue.message),
    } satisfies ActionData;
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
    mode: "uncontrolled",
    initialValues: {
      companyCode: "",
      email: "",
    },
    validate: schemaResolver(formSchema, { sync: true }),
  });

  const handleSubmit = form.onSubmit((data) => {
    const fd = new FormData();
    fd.set("companyCode", data.companyCode);
    fd.set("email", data.email);
    submit(fd, {
      method: "post",
      encType: "application/x-www-form-urlencoded",
    });
  });

  return (
    <RouterForm method="post" noValidate onSubmit={handleSubmit}>
      <Stack gap="lg">
        <Stack gap={6} ta="center">
          <Title order={1} size="h2">
            パスワード再設定
          </Title>
          <Text c="dimmed" size="sm">
            登録済みのメールアドレスに再設定用リンクを送信します
          </Text>
        </Stack>

        <Stack gap="md">
          <TextInput
            key={form.key("companyCode")}
            {...form.getInputProps("companyCode")}
            autoComplete="organization"
            label="企業コード"
            placeholder="company-code"
          />
          <TextInput
            key={form.key("email")}
            {...form.getInputProps("email")}
            autoComplete="email"
            label="メールアドレス"
            placeholder="m@example.com"
            type="email"
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

          {actionData?.message === "ok" ? (
            <Alert color="teal" variant="light">
              再設定メールを送信しました。メール内のリンクからパスワードを再設定してください。
            </Alert>
          ) : null}

          <Button fullWidth loading={isSubmitting} type="submit">
            再設定リンクを送信
          </Button>
        </Stack>

        <Text size="sm" ta="center">
          <Anchor component={Link} to="/login">
            ログイン画面へ
          </Anchor>
        </Text>
      </Stack>
    </RouterForm>
  );
}
