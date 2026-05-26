import { debounce, parseAsInteger, parseAsString } from "nuqs";

const FILTER_DEBOUNCE_MS = 300;

// 従業員一覧のURLクエリを一元管理する。
export const employeeQueryParsers = {
  pageParam: parseAsInteger.withOptions({ shallow: false }),
  limitParam: parseAsInteger.withOptions({ shallow: false }),
  nameFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  emailFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  adminFilter: parseAsString.withOptions({ shallow: false }),
  statusFilter: parseAsString.withOptions({ shallow: false }),
  orderByParam: parseAsString.withOptions({ shallow: false }),
  orderDirectionParam: parseAsString.withOptions({ shallow: false }),
} as const;

export const employeeQueryUrlKeys = {
  pageParam: "page",
  limitParam: "limit",
  nameFilter: "name",
  emailFilter: "email",
  adminFilter: "is_admin",
  statusFilter: "status",
  orderByParam: "orderBy",
  orderDirectionParam: "orderDirection",
} as const;
