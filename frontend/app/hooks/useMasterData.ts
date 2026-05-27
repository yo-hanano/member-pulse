import { useCallback, useEffect, useState } from "react";

import type {
  AllAreasQuery,
  AllGendersQuery,
  AllLocationsQuery,
  AllPrefecturesQuery,
} from "~/generated/graphql";
import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

type AreaMaster = NonNullable<NonNullable<AllAreasQuery["allAreas"]>[number]>;
type GenderMaster = NonNullable<NonNullable<AllGendersQuery["allGenders"]>[number]>;
type LocationMaster = NonNullable<NonNullable<AllLocationsQuery["allLocations"]>[number]>;
type PrefectureMaster = NonNullable<NonNullable<AllPrefecturesQuery["allPrefectures"]>[number]>;

type CacheEntry<T> = {
  data?: T;
  error?: unknown;
  promise?: Promise<T>;
  fetchedAt?: number;
};

// master系の取得結果を短時間だけメモリに保持して、画面間の再取得を減らす。
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const MASTER_CACHE_KEYS = {
  areas: "allAreas",
  locations: "allLocations",
  genders: "allGenders",
  prefectures: "allPrefectures",
} as const;

const isFresh = <T>(entry?: CacheEntry<T>) => {
  if (!entry?.fetchedAt) return false;
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
};

// master cache を個別キーまたは全消去で破棄する。
export const invalidateMasterData = (...keys: string[]) => {
  if (keys.length === 0) {
    cache.clear();
    return;
  }
  keys.forEach((key) => cache.delete(key));
};

export const invalidateMasterAreas = () => invalidateMasterData(MASTER_CACHE_KEYS.areas);
export const invalidateMasterLocations = () => invalidateMasterData(MASTER_CACHE_KEYS.locations);
export const invalidateMasterGenders = () => invalidateMasterData(MASTER_CACHE_KEYS.genders);
export const invalidateMasterPrefectures = () =>
  invalidateMasterData(MASTER_CACHE_KEYS.prefectures);

// 取得済み master を再利用しつつ、必要なら GraphQL から再読込する共通 hook。
const useCachedMaster = <T>(key: string, fetcher: () => Promise<T>) => {
  const [state, setState] = useState<{ data: T | undefined; loading: boolean; error: unknown }>(
    () => {
      const entry = cache.get(key) as CacheEntry<T> | undefined;
      if (entry?.data && isFresh(entry)) {
        return { data: entry.data, loading: false, error: entry.error };
      }
      return { data: entry?.data, loading: !entry?.data, error: entry?.error };
    },
  );

  useEffect(() => {
    let active = true;
    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (entry?.data && isFresh(entry)) {
      setState({ data: entry.data, loading: false, error: entry.error });
      return () => {
        active = false;
      };
    }

    const promise = entry?.promise ?? fetcher();
    cache.set(key, { ...entry, promise });
    setState((prev) => ({ ...prev, loading: true }));

    promise
      .then((data) => {
        cache.set(key, { data, fetchedAt: Date.now() });
        if (active) setState({ data, loading: false, error: undefined });
      })
      .catch((error) => {
        cache.set(key, { error, fetchedAt: Date.now() });
        if (active) setState({ data: undefined, loading: false, error });
      });

    return () => {
      active = false;
    };
  }, [key, fetcher]);

  return state;
};

// エリア master を取得する薄い wrapper。
export const useMasterAreas = () => {
  const fetcher = useCallback(async () => {
    const client = getGraphQLClient();
    const sdk = getSdk(client);
    const { allAreas } = await sdk.allAreas();
    return (allAreas ?? []).filter((area): area is AreaMaster => Boolean(area));
  }, []);
  return useCachedMaster(MASTER_CACHE_KEYS.areas, fetcher);
};

// 拠点 master を取得する薄い wrapper。
export const useMasterLocations = () => {
  const fetcher = useCallback(async () => {
    const client = getGraphQLClient();
    const sdk = getSdk(client);
    const { allLocations } = await sdk.allLocations();
    return (allLocations ?? []).filter((location): location is LocationMaster => Boolean(location));
  }, []);
  return useCachedMaster(MASTER_CACHE_KEYS.locations, fetcher);
};

// 性別 master を取得する薄い wrapper。
export const useMasterGenders = () => {
  const fetcher = useCallback(async () => {
    const client = getGraphQLClient();
    const sdk = getSdk(client);
    const { allGenders } = await sdk.allGenders();
    return (allGenders ?? []).filter((gender): gender is GenderMaster => Boolean(gender));
  }, []);
  return useCachedMaster(MASTER_CACHE_KEYS.genders, fetcher);
};

// 都道府県 master を取得する薄い wrapper。
export const useMasterPrefectures = () => {
  const fetcher = useCallback(async () => {
    const client = getGraphQLClient();
    const sdk = getSdk(client);
    const { allPrefectures } = await sdk.allPrefectures();
    return (allPrefectures ?? []).filter((prefecture): prefecture is PrefectureMaster =>
      Boolean(prefecture),
    );
  }, []);
  return useCachedMaster(MASTER_CACHE_KEYS.prefectures, fetcher);
};
