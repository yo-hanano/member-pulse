import { Button, Input, ListBox, Select, Surface } from "@heroui/react";
import { X } from "lucide-react";
import type { Key } from "react";
import { useMemo, useState } from "react";

import type { AreaListItemFragment } from "~/generated/graphql";

interface Props {
  areas: AreaListItemFragment[];
  name: string | null;
  code: string | null;
  areaId: string | null;
  onFilterChange: (updates: Record<string, string | null>) => void;
}

// 拠点一覧のフィルタ入力UIを表示し、変更内容を親へ通知する。
export function BranchFiltersPanel({ areas, name, code, areaId, onFilterChange }: Props) {
  const [areaKeyword, setAreaKeyword] = useState("");

  // エリア選択ポップオーバー内の検索キーワードで候補を絞り込む。
  const filteredAreas = useMemo(() => {
    const keyword = areaKeyword.trim().toLowerCase();
    if (!keyword) return areas;
    return areas.filter((area) => (area.name ?? "").toLowerCase().includes(keyword));
  }, [areaKeyword, areas]);

  const fieldLabelClassName = "app-filter-label";
  const codeFieldClassName = "app-filter-field-sm";
  const nameFieldClassName = "app-filter-field-md";
  const areaTriggerClassName = areaId ? "app-filter-field-md pr-14" : "app-filter-field-md";

  return (
    <Surface className="app-form-surface">
      <div className="app-filter-panel">
        <div className="app-filter-group">
          <p className={fieldLabelClassName}>拠点コード</p>
          <Input
            className={codeFieldClassName}
            aria-label="拠点コードで絞り込み"
            placeholder="拠点コード"
            variant="secondary"
            value={code ?? ""}
            onChange={(event) => onFilterChange({ code: event.target.value || null, page: "1" })}
          />
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>拠点名</p>
          <Input
            className={nameFieldClassName}
            aria-label="拠点名で絞り込み"
            placeholder="拠点名"
            variant="secondary"
            value={name ?? ""}
            onChange={(event) => onFilterChange({ name: event.target.value || null, page: "1" })}
          />
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>エリア</p>
          <div className="relative">
            <Select
              variant="secondary"
              aria-label="エリアで絞り込み"
              value={areaId || null}
              onChange={(key: Key | Key[] | null) => onFilterChange({ areaId: key ? String(key) : null, page: "1" })}
            >
              <Select.Trigger className={areaTriggerClassName}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="app-select-popover app-select-popover-searchable">
                <div className="border-border/60 border-b p-2">
                  <Input
                    className="h-8 w-full"
                    aria-label="エリア名で検索"
                    placeholder="エリア名で検索"
                    value={areaKeyword}
                    onChange={(event) => setAreaKeyword(event.target.value)}
                  />
                </div>
                <ListBox>
                  {filteredAreas.map((area) => (
                    <ListBox.Item id={String(area.id)} key={String(area.id)} textValue={area.name ?? ""}>
                      {area.name ?? ""}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {areaId ? (
              <button
                type="button"
                aria-label="エリア選択を解除"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-8 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setAreaKeyword("");
                  onFilterChange({ areaId: null, page: "1" });
                }}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="app-filter-actions">
          <Button
          className="app-primary-button app-primary-button-compact"
          onPress={() => {
            setAreaKeyword("");
            onFilterChange({
              code: null,
              name: null,
              areaId: null,
              page: "1",
            });
          }}
        >
          条件をクリア
          </Button>
        </div>
      </div>
    </Surface>
  );
}
