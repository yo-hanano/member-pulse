import { debounce, parseAsInteger, parseAsString } from "nuqs";

const FILTER_DEBOUNCE_MS = 300;

// 会員一覧の URL クエリを一元管理する。
export const memberQueryParsers = {
  pageParam: parseAsInteger.withOptions({ shallow: false }),
  limitParam: parseAsInteger.withOptions({ shallow: false }),
  nameFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  sourceFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  locationIdFilter: parseAsString.withOptions({ shallow: false }),
  joinedAtFromFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  joinedAtToFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  statusFilter: parseAsString.withOptions({ shallow: false }),
  orderByParam: parseAsString.withOptions({ shallow: false }),
  orderDirectionParam: parseAsString.withOptions({ shallow: false }),
} as const;

export const memberQueryUrlKeys = {
  pageParam: "page",
  limitParam: "limit",
  nameFilter: "name",
  sourceFilter: "source",
  locationIdFilter: "locationId",
  joinedAtFromFilter: "joinedAtFrom",
  joinedAtToFilter: "joinedAtTo",
  statusFilter: "status",
  orderByParam: "orderBy",
  orderDirectionParam: "orderDirection",
} as const;
