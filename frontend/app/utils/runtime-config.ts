export type RuntimeConfig = {
  graphqlPath: string;
};

let cache: RuntimeConfig | null = null;

export const getRuntimeConfig = async (): Promise<RuntimeConfig> => {
  if (cache) {
    return cache;
  }

  // CSR では実行時設定を BFF から取得して利用する。
  const res = await fetch("/runtime-config.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("failed to load runtime config");
  }

  cache = (await res.json()) as RuntimeConfig;
  return cache;
};
