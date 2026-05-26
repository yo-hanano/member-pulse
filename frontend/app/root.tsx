import { Toast } from "@heroui/react";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { CommandMenu } from "./components/composed/command-menu";
import { BadRequestError } from "./components/errors/bad-request-error";
import { ForbiddenError } from "./components/errors/forbidden";
import { GeneralError } from "./components/errors/general-error";
import { NotFoundError } from "./components/errors/not-found-error";
import { UnauthorisedError } from "./components/errors/unauthorized-error";
import { SearchProvider } from "./context/search-context";
import { ThemeProvider } from "./context/theme-context";

const themeScript = `
(() => {
  try {
    const storageKey = "frontend-theme";
    const storedTheme = localStorage.getItem(storageKey) || "system";
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const resolvedTheme = storedTheme === "system" ? systemTheme : storedTheme;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.dataset.theme = resolvedTheme;
  } catch (_) {}
})();
`;

export const meta = (_: Route.MetaArgs) => {
  return [{ title: "Frontend" }, { name: "description", content: "Web frontend" }];
};

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <NuqsAdapter>
      <ThemeProvider>
        <SearchProvider>
          <Outlet />
          <CommandMenu />
          <Toast.Provider placement="top" />
        </SearchProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // RouteErrorResponseをステータス別に画面へマッピングする。
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 400:
        return <BadRequestError />;
      case 401:
        return <UnauthorisedError />;
      case 403:
        return <ForbiddenError />;
      case 404:
        return <NotFoundError />;
      default:
        return <GeneralError />;
    }
  }

  // 開発時のみ、予期しない例外の詳細を表示する。
  if (import.meta.env.DEV && error && error instanceof Error) {
    return (
      <main className="container mx-auto p-4 pt-16">
        <h1>Development Error</h1>
        <p>{error.message}</p>
        <pre className="w-full overflow-x-auto p-4">
          <code>{error.stack}</code>
        </pre>
      </main>
    );
  }

  // 本番では汎用エラー画面を表示する。
  return <GeneralError />;
}
