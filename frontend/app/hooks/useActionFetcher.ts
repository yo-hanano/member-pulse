import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";

import { useActionResultEffect, type ActionResult } from "~/hooks/useActionResultEffect";

type Method = "post";

/**
 * React Router fetcher action をラップし、submit と成功後処理をまとめて扱う高レベル hook。
 */
export function useActionFetcher<TAction extends ActionResult>(opts: {
  defaultAction: string | ((...a: any[]) => string);
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

  const submit = (payload?: any, actionOverride?: any[]) => {
    const action =
      typeof opts.defaultAction === "function"
        ? (opts.defaultAction as any)(...(actionOverride ?? []))
        : opts.defaultAction;

    const encType = opts.encType ?? "application/json";
    const body =
      encType === "application/json" && payload instanceof FormData === false
        ? JSON.stringify(payload ?? {})
        : (payload ?? new FormData());

    f.submit(body as any, { method: opts.method ?? "post", encType, action });
  };

  return {
    submit,
    submitting: f.state === "submitting",
    data,
    error: (data as any)?.error as string | undefined,
    state: f.state,
    justFinishedOk: f.state === "idle" && data?.message === "ok",
  } as const;
}
