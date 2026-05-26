import { debounce, parseAsInteger, parseAsString } from "nuqs";

const FILTER_DEBOUNCE_MS = 300;

// エリア一覧のURLクエリを一元管理する。
export const areaQueryParsers = {
  pageParam: parseAsInteger.withOptions({ shallow: false }),
  limitParam: parseAsInteger.withOptions({ shallow: false }),
  nameFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  orderByParam: parseAsString.withOptions({ shallow: false }),
  orderDirectionParam: parseAsString.withOptions({ shallow: false }),
} as const;

export const areaQueryUrlKeys = {
  pageParam: "page",
  limitParam: "limit",
  nameFilter: "name",
  orderByParam: "orderBy",
  orderDirectionParam: "orderDirection",
} as const;
