import { debounce, parseAsInteger, parseAsString } from "nuqs";

const FILTER_DEBOUNCE_MS = 300;

// リード一覧の URL クエリを一元管理する。
export const leadQueryParsers = {
  pageParam: parseAsInteger.withOptions({ shallow: false }),
  limitParam: parseAsInteger.withOptions({ shallow: false }),
  studentNameFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  guardianNameFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  schoolNameFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  channelFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  inquiryAtFromFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  inquiryAtToFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  statusFilter: parseAsString.withOptions({ shallow: false }),
  orderByParam: parseAsString.withOptions({ shallow: false }),
  orderDirectionParam: parseAsString.withOptions({ shallow: false }),
} as const;

export const leadQueryUrlKeys = {
  pageParam: "page",
  limitParam: "limit",
  studentNameFilter: "studentName",
  guardianNameFilter: "guardianName",
  schoolNameFilter: "schoolName",
  channelFilter: "channel",
  inquiryAtFromFilter: "inquiryAtFrom",
  inquiryAtToFilter: "inquiryAtTo",
  statusFilter: "status",
  orderByParam: "orderBy",
  orderDirectionParam: "orderDirection",
} as const;
