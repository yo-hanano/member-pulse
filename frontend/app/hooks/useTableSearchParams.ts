import { type UseQueryStatesKeysMap, useQueryStates } from "nuqs";
import { useMemo } from "react";

import { type TableSortingState, toSortDescriptor } from "~/components/table/table-utils";

type TableQueryState = {
  pageParam: number | null;
  limitParam: number | null;
  orderByParam: string | null;
  orderDirectionParam: string | null;
};

type TableQueryTransforms = {
  fromQuery?: (orderBy: string) => string;
  toQuery?: (orderBy: string) => string;
};

// 一覧テーブルで共通になるページングとソートのURL同期をまとめる。
export function useTableSearchParams({
  parsers,
  urlKeys,
  defaultPage = 1,
  defaultLimit = 10,
  transforms,
}: {
  parsers: UseQueryStatesKeysMap;
  urlKeys: Record<string, string>;
  defaultPage?: number;
  defaultLimit?: number;
  transforms?: TableQueryTransforms;
}) {
  const [queryState, setTableParams] = useQueryStates(parsers, {
    urlKeys,
  }) as unknown as [TableQueryState, (next: Partial<TableQueryState>) => Promise<unknown>];

  const page = queryState.pageParam ?? defaultPage;
  const limit = queryState.limitParam ?? defaultLimit;

  // URL上の orderBy をテーブル表示向けのソート状態へ変換する。
  const sorting: TableSortingState = useMemo(() => {
    if (!queryState.orderByParam) return [];
    const orderBy = transforms?.fromQuery?.(queryState.orderByParam) ?? queryState.orderByParam;
    return [{ id: orderBy, desc: queryState.orderDirectionParam === "desc" }];
  }, [queryState.orderByParam, queryState.orderDirectionParam, transforms]);

  const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);

  // テーブル側のソート変更をURLクエリへ反映する。
  const setSorting = (next: TableSortingState) => {
    if (next[0]) {
      const orderBy = transforms?.toQuery?.(String(next[0].id)) ?? String(next[0].id);
      void setTableParams({
        orderByParam: orderBy,
        orderDirectionParam: next[0].desc ? "desc" : "asc",
        pageParam: 1,
      });
      return;
    }
    void setTableParams({ orderByParam: null, orderDirectionParam: null, pageParam: 1 });
  };

  // ページ番号・ページサイズ変更をURLクエリへ反映する。
  const setPage = (nextPage: number, nextLimit: number) => {
    void setTableParams({ pageParam: nextPage, limitParam: nextLimit });
  };

  // フィルタ変更時などにページだけを先頭へ戻す。
  const resetPage = () => {
    void setTableParams({ pageParam: 1 });
  };

  return {
    page,
    limit,
    sorting,
    sortDescriptor,
    setPage,
    setSorting,
    resetPage,
  };
}
