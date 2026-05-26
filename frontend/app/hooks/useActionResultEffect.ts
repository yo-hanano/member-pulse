import { toast } from "@heroui/react";
import { useEffect, useRef } from "react";

type NotifyPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

type ActionNotify = {
  type?: string;
  message: string;
  position?: NotifyPosition;
};

export type ActionResult = {
  message?: string;
  notify?: ActionNotify;
};

interface UseActionResultEffectParams<T extends ActionResult> {
  data?: T;
  successMessage?: string;
  onSuccess?: (data: T) => void;
}

// action 結果の通知表示と成功後処理を共通化する低レイヤー hook。
export function useActionResultEffect<T extends ActionResult>({
  data,
  successMessage = "ok",
  onSuccess,
}: UseActionResultEffectParams<T>) {
  const processedResultsRef = useRef(new WeakSet<object>());

  useEffect(() => {
    if (data == null) return;

    // 同じレスポンスオブジェクトに対する重複処理を防止する。
    if (processedResultsRef.current.has(data as object)) return;
    processedResultsRef.current.add(data as object);

    if (data.notify?.type === "success") toast.success(data.notify.message);
    if (data.notify?.type === "error") toast.danger(data.notify.message);
    if (data.notify?.type === "info") toast(data.notify.message);

    if (data.message === successMessage) onSuccess?.(data);
  }, [data, onSuccess, successMessage]);
}
