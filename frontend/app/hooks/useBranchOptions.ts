import { useEffect, useState } from "react";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

type BranchOption = {
  id?: string | null;
  code?: string | null;
  name?: string | null;
  prefecture?: {
    code?: string | null;
    name?: string | null;
  } | null;
};

interface UseBranchOptionsState {
  data: BranchOption[];
  loading: boolean;
  error: unknown;
}

// 拠点候補を GraphQL から検索し、Autocomplete 向けの一覧に整える。
export function useBranchOptions(searchText: string, selectedId: string | null) {
  const [state, setState] = useState<UseBranchOptionsState>({
    data: [],
    loading: true,
    error: undefined,
  });

  // 入力文字列と現在選択値に応じて拠点候補を再取得する。
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const sdk = getSdk(getGraphQLClient());
          const trimmed = searchText.trim();
          const [pageResult, selectedResult] = await Promise.all([
            sdk.branchPage({
              pagination: { offset: 0, limit: 10 },
              filter: trimmed ? { name: trimmed } : undefined,
            }),
            selectedId ? sdk.branchById({ branchId: selectedId }) : Promise.resolve(undefined),
          ]);

          const branches: BranchOption[] = (pageResult.branchPagination?.contents ?? []).flatMap((branch) =>
            branch?.id
              ? [{
                  id: branch.id,
                  code: branch.code,
                  name: branch.name,
                  prefecture: branch.prefecture,
                }]
              : [],
          );
          const selectedBranch: BranchOption | null = selectedResult?.branchById?.id
            ? {
                id: selectedResult.branchById.id,
                code: selectedResult.branchById.code,
                name: selectedResult.branchById.name,
                prefecture: selectedResult.branchById.prefecture,
              }
            : null;
          const mergedBranches =
            selectedBranch && !branches.some((branch) => branch.id === selectedBranch.id)
              ? [selectedBranch, ...branches]
              : branches;

          if (active) {
            setState({ data: mergedBranches, loading: false, error: undefined });
          }
        } catch (error) {
          if (active) {
            setState({ data: [], loading: false, error });
          }
        }
      })();
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchText, selectedId]);

  return state;
}
