import { debounce, parseAsInteger, parseAsString } from "nuqs";

const FILTER_DEBOUNCE_MS = 300;

// 生徒一覧のURLクエリを一元管理する。
export const studentQueryParsers = {
  pageParam: parseAsInteger.withOptions({ shallow: false }),
  limitParam: parseAsInteger.withOptions({ shallow: false }),
  codeFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  nameFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  kanaFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  branchIdFilter: parseAsString.withOptions({ shallow: false }),
  schoolNameFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  schoolTypeCodeFilter: parseAsString.withOptions({ shallow: false }),
  schoolGradeCodeFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  statusFilter: parseAsString.withOptions({ shallow: false }),
  orderByParam: parseAsString.withOptions({ shallow: false }),
  orderDirectionParam: parseAsString.withOptions({ shallow: false }),
} as const;

export const studentQueryUrlKeys = {
  pageParam: "page",
  limitParam: "limit",
  codeFilter: "code",
  nameFilter: "name",
  kanaFilter: "kana",
  branchIdFilter: "branchId",
  schoolNameFilter: "schoolName",
  schoolTypeCodeFilter: "schoolTypeCode",
  schoolGradeCodeFilter: "schoolGradeCode",
  statusFilter: "status",
  orderByParam: "orderBy",
  orderDirectionParam: "orderDirection",
} as const;
