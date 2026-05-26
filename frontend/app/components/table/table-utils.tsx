import type { SortDescriptor } from "@heroui/react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export type TableSortingState = Array<{ id: string; desc: boolean }>;

// 一覧のページ番号表示をコンパクトにするため、先頭/末尾と現在付近のみを返す。
export const getPageNumbers = (page: number, totalPages: number): Array<number | "ellipsis"> => {
  const pages: Array<number | "ellipsis"> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    return pages;
  }
  if (page <= 4) {
    pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
    return pages;
  }
  if (page >= totalPages - 3) {
    pages.push(1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    return pages;
  }
  pages.push(1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages);
  return pages;
};

// クエリ文字列で保持するソート状態とHeroUIのSortDescriptorを相互変換する。
export const toSortDescriptor = (sorting: TableSortingState): SortDescriptor | undefined => {
  const current = sorting[0];
  if (!current) return undefined;
  return {
    column: current.id,
    direction: current.desc ? "descending" : "ascending",
  };
};

// HeroUIのソートイベントをURL同期しやすい配列形式へ変換する。
export const toSortingState = (descriptor: SortDescriptor): TableSortingState => {
  return [{ id: String(descriptor.column), desc: descriptor.direction === "descending" }];
};

// ヘッダーのソート向きを統一アイコンで表示する。
export const renderSortIcon = (sortDirection?: "ascending" | "descending") => {
  if (sortDirection === "ascending") {
    return <ArrowUp className="text-muted-foreground size-3.5" />;
  }
  if (sortDirection === "descending") {
    return <ArrowDown className="text-muted-foreground size-3.5" />;
  }
  return <ArrowUpDown className="text-muted-foreground/70 size-3.5" />;
};
