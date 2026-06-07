import { parseAsString } from "nuqs";

// 売上一覧の URL クエリ（対象月・拠点）を一元管理する。
export const revenueQueryParsers = {
  monthFilter: parseAsString.withOptions({ shallow: false }),
  locationIdFilter: parseAsString.withOptions({ shallow: false }),
} as const;

export const revenueQueryUrlKeys = {
  monthFilter: "month",
  locationIdFilter: "locationId",
} as const;

// 当月を YYYY-MM 形式で返す。フィルタ未指定時の既定値。
export const currentMonthValue = () => new Date().toISOString().slice(0, 7);
