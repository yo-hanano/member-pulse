import { debounce, parseAsInteger, parseAsString } from "nuqs";

const FILTER_DEBOUNCE_MS = 300;

// 拠点一覧のURLクエリを一元管理する。
export const branchQueryParsers = {
  pageParam: parseAsInteger.withOptions({ shallow: false }),
  limitParam: parseAsInteger.withOptions({ shallow: false }),
  nameFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  codeFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  areaFilter: parseAsString.withOptions({ shallow: false }),
  orderByParam: parseAsString.withOptions({ shallow: false }),
  orderDirectionParam: parseAsString.withOptions({ shallow: false }),
} as const;

export const branchQueryUrlKeys = {
  pageParam: "page",
  limitParam: "limit",
  nameFilter: "name",
  codeFilter: "code",
  areaFilter: "areaId",
  orderByParam: "orderBy",
  orderDirectionParam: "orderDirection",
} as const;
