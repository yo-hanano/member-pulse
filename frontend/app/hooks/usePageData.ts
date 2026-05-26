import { useMemo } from "react";

type PageData<T> = {
  contents: T[];
  limit: number;
  offset: number;
  totalCount: number;
  totalPages: number;
  pageNo: number;
};

// GraphQL のページング結果を UI で扱いやすい形へ変換する。
export function usePageData<T>(
  page?: {
    contents?: (T | null | undefined)[] | null;
    limit?: number | null;
    offset?: number | null;
    totalCount?: number | null;
    totalPages?: number | null;
  } | null,
): PageData<T> {
  return useMemo(() => {
    const limit = page?.limit ?? 10;
    const offset = page?.offset ?? 0;
    return {
      contents: (page?.contents ?? []).filter((p): p is T => !!p),
      limit,
      offset,
      totalCount: page?.totalCount ?? 0,
      totalPages: page?.totalPages ?? 1,
      pageNo: limit ? Math.floor(offset / limit) + 1 : 1,
    };
  }, [page]);
}
