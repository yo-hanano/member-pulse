import { useEffect, useState } from "react";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

type SchoolOption = {
  code?: string | null;
  name?: string | null;
  prefectureCode?: string | null;
  schoolTypeCode?: string | null;
};

interface UseSchoolOptionsState {
  data: SchoolOption[];
  loading: boolean;
  error: unknown;
}

// 学校候補を GraphQL から検索し、Autocomplete 向けの一覧に整える。
export function useSchoolOptions(searchText: string, selectedCode: string | null) {
  const [state, setState] = useState<UseSchoolOptionsState>({
    data: [],
    loading: true,
    error: undefined,
  });

  // 入力文字列と現在選択値に応じて学校候補を再取得する。
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const sdk = getSdk(getGraphQLClient());
          const trimmed = searchText.trim();
          const [pageResult, selectedResult] = await Promise.all([
            sdk.schoolPagination({
              pagination: { offset: 0, limit: 10 },
              filter: trimmed ? { name: trimmed } : undefined,
            }),
            selectedCode ? sdk.schoolByCode({ schoolCode: selectedCode }) : Promise.resolve(undefined),
          ]);

          const schools: SchoolOption[] = (pageResult.schoolPagination?.contents ?? []).flatMap((school) =>
            school?.code
              ? [{
                  code: school.code,
                  name: school.name,
                  prefectureCode: school.prefectureCode,
                  schoolTypeCode: school.schoolTypeCode,
                }]
              : [],
          );
          const selectedSchool: SchoolOption | null = selectedResult?.schoolByCode?.code
            ? {
                code: selectedResult.schoolByCode.code,
                name: selectedResult.schoolByCode.name,
                prefectureCode: selectedResult.schoolByCode.prefectureCode,
                schoolTypeCode: selectedResult.schoolByCode.schoolTypeCode,
              }
            : null;
          const mergedSchools =
            selectedSchool && !schools.some((school) => school.code === selectedSchool.code)
              ? [selectedSchool, ...schools]
              : schools;

          if (active) {
            setState({ data: mergedSchools, loading: false, error: undefined });
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
  }, [searchText, selectedCode]);

  return state;
}
