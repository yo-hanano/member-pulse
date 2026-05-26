type QueryPatchValue = string | number | null;

type QueryKeyMap<TUpdateKey extends string> = Partial<Record<TUpdateKey, string>>;

type QueryPatchOptions = {
  numericKeys?: readonly string[];
};

// フィルタ変更時に、変更されたキーだけを nuqs の setQuery へ渡すための差分 payload を作る。
// 未変更の debounce 付きキーを含めると即時更新と遅延更新が混ざり、loader が二重に走るため除外する。
export function buildChangedQueryPatch<TUpdateKey extends string>(
  updates: Partial<Record<TUpdateKey, string | null>>,
  keyMap: QueryKeyMap<TUpdateKey> = {},
  options: QueryPatchOptions = {},
) {
  const patch: Record<string, QueryPatchValue> = { pageParam: 1 };
  const numericKeys = new Set(options.numericKeys ?? []);

  for (const [key, value] of Object.entries(updates) as [TUpdateKey, string | null | undefined][]) {
    const queryKey = keyMap[key as TUpdateKey] ?? key;
    patch[queryKey] = value == null ? null : numericKeys.has(queryKey) ? Number(value) : value;
  }

  return patch;
}
