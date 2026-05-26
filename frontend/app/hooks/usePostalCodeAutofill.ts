import { useEffect, useMemo, useRef } from "react";

import type { PostalCodeAddress } from "~/lib/postal-code";
import { lookupPostalCodeAddress } from "~/lib/postal-code";

type PrefectureLike = {
  code?: string | null;
  name?: string | null;
};

interface UsePostalCodeAutofillParams {
  zipCode: string;
  prefectures: PrefectureLike[];
  onAutofill: (result: PostalCodeAddress) => void;
  enabled?: boolean;
  debounceMs?: number;
}

// 郵便番号から都道府県と住所を補完する共通 hook。
export function usePostalCodeAutofill({
  zipCode,
  prefectures,
  onAutofill,
  enabled = true,
  debounceMs = 300,
}: UsePostalCodeAutofillParams) {
  const onAutofillRef = useRef(onAutofill);
  const prefectureCodeByName = useMemo(() => {
    return new Map(
      prefectures.map((prefecture) => [prefecture.name ?? "", prefecture.code ?? ""] as const),
    );
  }, [prefectures]);

  useEffect(() => {
    onAutofillRef.current = onAutofill;
  }, [onAutofill]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const normalized = zipCode.replace(/\D/g, "");
    if (normalized.length !== 7) {
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const result = await lookupPostalCodeAddress(normalized);
          if (!active || !result) {
            return;
          }

          const prefectureCode = prefectureCodeByName.get(result.prefectureName);
          if (!prefectureCode) {
            return;
          }

          onAutofillRef.current({
            ...result,
            prefectureCode,
          });
        } catch {
          // 住所補完に失敗しても手入力は継続できるようにする。
        }
      })();
    }, debounceMs);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [debounceMs, enabled, prefectureCodeByName, zipCode]);
}
