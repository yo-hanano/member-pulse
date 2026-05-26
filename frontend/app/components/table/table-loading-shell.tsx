import type { ReactNode } from "react";

interface Props {
  isLoading?: boolean;
  children: ReactNode;
}

// 一覧テーブル上部のローディングバーとフェード表現を共通化する。
export function TableLoadingShell({ isLoading, children }: Props) {
  return (
    <div className="relative">
      {isLoading ? (
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-1 overflow-hidden rounded-full bg-foreground/15">
          <div
            className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-accent/60"
            style={{ animation: "table-loading-slide 1.15s ease-in-out infinite" }}
          />
        </div>
      ) : null}

      {children}

      <style>
        {`@keyframes table-loading-slide {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(340%); }
        }`}
      </style>
    </div>
  );
}
