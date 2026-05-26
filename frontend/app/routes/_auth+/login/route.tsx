import { useEffect } from "react";
import { redirect, useNavigate } from "react-router";
import { LoginForm } from "./components/login-form";
import { loginSchema } from "./components/schema";

export const clientAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const values = {
    companyCode: formData.get("companyCode"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: ["不正な入力です"], values };
  }

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(parsed.data),
  });

  if (res.ok) {
    return redirect("/");
  }

  const body = await res.json().catch(() => null);
  return {
    error: [body?.error ?? "メールアドレスまたはパスワードが間違っています"],
    values,
  };
};

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    void fetch("/auth/me", { credentials: "include" })
      .then((res) => {
        if (res.ok && !cancelled) {
          navigate("/", { replace: true });
        }
      })
      .catch(() => {
        // 未ログインやネットワークエラー時もログインフォームはそのまま表示する
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="space-y-4">
      <LoginForm />
    </div>
  );
}
