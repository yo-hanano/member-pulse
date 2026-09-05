import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";

import { type ActionResult, useActionResultEffect } from "~/hooks/useActionResultEffect";

type Method = "post";

/**
 * React Router fetcher action をラップし、submit と成功後処理をまとめて扱う高レベル hook。
 */
export function useActionFetcher<TAction extends ActionResult>(opts: {
  // 引数列は呼び出し側でまちまちなので、反変位置の never[] で任意の関数を受ける
  defaultAction: string | ((...a: never[]) => string);
  method?: Method;
  encType?: "application/json" | "multipart/form-data";
  onSuccess?: (data: TAction) => void;
}) {
  const f = useFetcher<TAction>();
  const data = f.data as TAction | undefined;

  const onSuccessRef = useRef(opts.onSuccess);
  useEffect(() => {
    onSuccessRef.current = opts.onSuccess;
  }, [opts.onSuccess]);

  useActionResultEffect({
    data,
    onSuccess: (result) => onSuccessRef.current?.(result),
  });

  const submit = (payload?: unknown, actionOverride?: unknown[]) => {
    const action =
      typeof opts.defaultAction === "function"
        ? (opts.defaultAction as (...a: unknown[]) => string)(...(actionOverride ?? []))
        : opts.defaultAction;

    const encType = opts.encType ?? "application/json";
    // JSON 送信でも FormData を渡されたときは multipart として素通しする
    const body =
      encType === "application/json" && !(payload instanceof FormData)
        ? JSON.stringify(payload ?? {})
        : ((payload ?? new FormData()) as FormData);

    f.submit(body, { method: opts.method ?? "post", encType, action });
  };

  return {
    submit,
    submitting: f.state === "submitting",
    data,
    // action 側がエラーを返すケースがあるが ActionResult には含めていないため、ここで拾う
    error: (data as (TAction & { error?: string }) | undefined)?.error,
    state: f.state,
    justFinishedOk: f.state === "idle" && data?.message === "ok",
  } as const;
}
