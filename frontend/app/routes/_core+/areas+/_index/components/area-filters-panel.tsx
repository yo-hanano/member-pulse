import { Button, Input, Surface } from "@heroui/react";
import type { ChangeEvent } from "react";

interface Props {
  name: string | null;
  onFilterChange: (updates: Record<string, string | null>) => void;
}

// エリア一覧のフィルタ入力UIを表示し、変更内容を親へ通知する
export function AreaFiltersPanel({ name, onFilterChange }: Props) {
  const fieldLabelClassName = "app-filter-label";
  const fieldClassName = "app-filter-field-lg";

  return (
    <Surface className="app-form-surface">
      <div className="app-filter-panel">
        <div className="app-filter-group">
          <p className={fieldLabelClassName}>エリア名</p>
          <Input
            aria-label="エリア名で絞り込み"
            className={fieldClassName}
            placeholder="エリア名"
            variant="secondary"
            value={name ?? ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onFilterChange({ name: event.target.value || null, page: "1" })}
          />
        </div>

        <div className="app-filter-actions">
          <Button
            className="app-primary-button app-primary-button-compact"
            onPress={() => {
              onFilterChange({
                name: null,
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
