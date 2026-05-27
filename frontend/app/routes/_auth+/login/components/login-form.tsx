import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Anchor, Button, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { AlertCircle, LogIn } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, Form as RouterForm, useActionData, useNavigation, useSubmit } from "react-router";
import type { clientAction } from "../route";
import { type LoginSchema, loginSchema } from "./schema";

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
    // 認証失敗後も入力内容を復元し、再入力の負担を減らす。
    if (!actionData?.values) return;
    reset({
      companyCode: actionData.values.companyCode ? String(actionData.values.companyCode) : "",
      email: actionData.values.email ? String(actionData.values.email) : "",
      password: actionData.values.password ? String(actionData.values.password) : "",
    });
  }, [actionData?.values, reset]);

  useEffect(() => {
    // バリデーションエラー時は先頭の不備へフォーカスする。
    if (errors.companyCode) setFocus("companyCode");
    else if (errors.email) setFocus("email");
    else if (errors.password) setFocus("password");
  }, [errors, setFocus]);

  const onValid = (data: LoginSchema) => {
    // React Router の action に寄せ、BFF の /auth/login 呼び出しを route 側へ集約する。
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
    <RouterForm className={className} method="post" noValidate onSubmit={handleSubmit(onValid)}>
      <Stack gap="lg">
        <Stack gap={6} ta="center">
          <Title order={1} size="h2">
            ログイン
          </Title>
          <Text c="dimmed" size="sm">
            企業コード・メールアドレス・パスワードを入力してください
          </Text>
        </Stack>

        <Stack gap="md">
          <TextInput
            {...register("companyCode")}
            autoComplete="organization"
            error={errors.companyCode?.message}
            label="企業コード"
            placeholder="例: dev"
            radius="sm"
            size="md"
          />
          <TextInput
            {...register("email")}
            autoComplete="email"
            error={errors.email?.message}
            label="メールアドレス"
            placeholder="name@example.com"
            radius="sm"
            size="md"
            type="email"
          />
          <PasswordInput
            {...register("password")}
            autoComplete="current-password"
            error={errors.password?.message}
            label="パスワード"
            placeholder="パスワードを入力"
            radius="sm"
            rightSectionWidth={42}
            size="md"
          />

          <Anchor component={Link} size="sm" ta="right" to="/password/reset">
            パスワードをお忘れですか？
          </Anchor>

          {actionData?.error?.length ? (
            <Alert color="red" icon={<AlertCircle size={16} />} radius="sm" variant="light">
              {actionData.error.map((msg) => (
                <Text key={msg} size="sm">
                  {msg}
                </Text>
              ))}
            </Alert>
          ) : null}

          <Button
            fullWidth
            leftSection={<LogIn size={18} />}
            loading={isSubmitting}
            radius="sm"
            size="md"
            type="submit"
          >
            ログイン
          </Button>
        </Stack>
      </Stack>
    </RouterForm>
  );
}
