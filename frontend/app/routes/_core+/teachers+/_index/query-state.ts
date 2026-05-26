import { debounce, parseAsInteger, parseAsString } from "nuqs";

const FILTER_DEBOUNCE_MS = 300;

// 講師一覧のURLクエリを一元管理する。
export const teacherQueryParsers = {
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
  genderCodeFilter: parseAsString.withOptions({ shallow: false }),
  schoolNameFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  schoolGradeCodeFilter: parseAsString.withOptions({ shallow: false }),
  phoneFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  emailFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  statusFilter: parseAsString.withOptions({ shallow: false }),
  orderByParam: parseAsString.withOptions({ shallow: false }),
  orderDirectionParam: parseAsString.withOptions({ shallow: false }),
} as const;

export const teacherQueryUrlKeys = {
  pageParam: "page",
  limitParam: "limit",
  codeFilter: "code",
  nameFilter: "name",
  kanaFilter: "kana",
  genderCodeFilter: "genderCode",
  schoolNameFilter: "schoolName",
  schoolGradeCodeFilter: "schoolGradeCode",
  phoneFilter: "phone",
  emailFilter: "email",
  statusFilter: "status",
  orderByParam: "orderBy",
  orderDirectionParam: "orderDirection",
} as const;
