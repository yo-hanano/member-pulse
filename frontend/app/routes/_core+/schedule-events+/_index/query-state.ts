import { debounce, parseAsInteger, parseAsString } from "nuqs";

const FILTER_DEBOUNCE_MS = 300;

// 訪問・来塾予定一覧の URL クエリを一元管理する。
export const scheduleEventQueryParsers = {
  pageParam: parseAsInteger.withOptions({ shallow: false }),
  limitParam: parseAsInteger.withOptions({ shallow: false }),
  leadIdFilter: parseAsString.withOptions({ shallow: false }),
  activityTypeFilter: parseAsString.withOptions({ shallow: false }),
  noteFilter: parseAsString.withOptions({
    shallow: false,
    limitUrlUpdates: debounce(FILTER_DEBOUNCE_MS),
  }),
  orderByParam: parseAsString.withOptions({ shallow: false }),
  orderDirectionParam: parseAsString.withOptions({ shallow: false }),
} as const;

export const scheduleEventQueryUrlKeys = {
  pageParam: "page",
  limitParam: "limit",
  leadIdFilter: "leadId",
  activityTypeFilter: "activityType",
  noteFilter: "note",
  orderByParam: "orderBy",
  orderDirectionParam: "orderDirection",
} as const;
