import { useEffect, useState } from "react";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

type MasterOption = {
  code?: string | null;
  name?: string | null;
  sortOrder?: number | null;
};

interface UseScheduleEventMasterOptionsState {
  typeOptions: MasterOption[];
  statusOptions: MasterOption[];
  loading: boolean;
  error: unknown;
}

const toSortedOptions = (items: MasterOption[]) =>
  [...items].sort((left, right) => {
    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return (left.code ?? "").localeCompare(right.code ?? "");
  });

// 訪問・来塾予定の正式マスタを GraphQL から取得し、選択肢用に整える。
export function useScheduleEventMasterOptions() {
  const [state, setState] = useState<UseScheduleEventMasterOptionsState>({
    typeOptions: [],
    statusOptions: [],
    loading: true,
    error: undefined,
  });

  // 画面表示時に master を一括取得する。
  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const sdk = getSdk(getGraphQLClient());
        const [typeResult, statusResult] = await Promise.all([
          sdk.allScheduleEventTypes(),
          sdk.allScheduleEventStatuses(),
        ]);

        if (!active) return;

        setState({
          typeOptions: toSortedOptions((typeResult.allScheduleEventTypes ?? []).filter((item) => Boolean(item?.code)) as MasterOption[]),
          statusOptions: toSortedOptions(
            (statusResult.allScheduleEventStatuses ?? []).filter((item) => Boolean(item?.code)) as MasterOption[],
          ),
          loading: false,
          error: undefined,
        });
      } catch (error) {
        if (active) {
          setState({ typeOptions: [], statusOptions: [], loading: false, error });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
