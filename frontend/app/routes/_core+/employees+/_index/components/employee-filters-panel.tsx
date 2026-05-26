import { Button, Input, ListBox, Select, Surface } from "@heroui/react";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import type { Key } from "react";

import { EMPLOYEE_STATUS_OPTIONS } from "~/constants";
import { buildChangedQueryPatch } from "~/lib/query-state";
import {
  employeeQueryParsers,
  employeeQueryUrlKeys,
} from "~/routes/_core+/employees+/_index/query-state";

const roleOptions = [
  { value: "true", label: "管理者" },
  { value: "false", label: "一般" },
] as const;

// 顧客フィルタと同じ密度で、従業員一覧のフィルタ UI と URL クエリ同期を閉じ込める。
export function EmployeeFiltersPanel() {
  const [{ nameFilter, emailFilter, adminFilter, statusFilter }, setQuery] = useQueryStates(
    employeeQueryParsers,
    { urlKeys: employeeQueryUrlKeys },
  );

  // フィルタ変更時は 1 ページ目へ戻す。
  const updateFilters = (updates: {
    nameFilter?: string | null;
    emailFilter?: string | null;
    adminFilter?: string | null;
    statusFilter?: string | null;
  }) => {
    const applyImmediately = updates.nameFilter === null || updates.emailFilter === null;

    setQuery(
      buildChangedQueryPatch(updates),
      applyImmediately ? { limitUrlUpdates: undefined } : undefined,
    );
  };

  const fieldLabelClassName = "app-filter-label";
  const nameFieldClassName = "app-filter-field-md";
  const emailFieldClassName = "app-filter-field-lg";
  const adminTriggerClassName = adminFilter ? "app-filter-field-sm pr-14" : "app-filter-field-sm";
  const statusTriggerClassName = statusFilter ? "app-filter-field-sm pr-14" : "app-filter-field-sm";

  return (
    <Surface className="app-form-surface">
      <div className="app-filter-panel">
        <div className="app-filter-group">
          <p className={fieldLabelClassName}>氏名</p>
          <Input
            className={nameFieldClassName}
            aria-label="氏名で絞り込み"
            placeholder="氏名"
            variant="secondary"
            value={nameFilter ?? ""}
            onChange={(event) => updateFilters({ nameFilter: event.target.value || null })}
          />
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>メールアドレス</p>
          <Input
            className={emailFieldClassName}
            aria-label="メールアドレスで絞り込み"
            placeholder="メールアドレス"
            variant="secondary"
            value={emailFilter ?? ""}
            onChange={(event) => updateFilters({ emailFilter: event.target.value || null })}
          />
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>ロール</p>
          <div className="relative">
            <Select
              variant="secondary"
              aria-label="ロールで絞り込み"
              value={adminFilter || null}
              onChange={(key: Key | Key[] | null) =>
                updateFilters({ adminFilter: key ? String(key) : null })
              }
            >
              <Select.Trigger className={adminTriggerClassName}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="app-select-popover">
                <ListBox>
                  {roleOptions.map((option) => (
                    <ListBox.Item id={option.value} key={option.value} textValue={option.label}>
                      {option.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {adminFilter ? (
              <button
                type="button"
                aria-label="ロール選択を解除"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-8 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  updateFilters({ adminFilter: null });
                }}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>状態</p>
          <div className="relative">
            <Select
              variant="secondary"
              aria-label="状態で絞り込み"
              value={statusFilter || null}
              onChange={(key: Key | Key[] | null) =>
                updateFilters({ statusFilter: key ? String(key) : null })
              }
            >
              <Select.Trigger className={statusTriggerClassName}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="app-select-popover">
                <ListBox>
                  {EMPLOYEE_STATUS_OPTIONS.map((option) => (
                    <ListBox.Item id={option.value} key={option.value} textValue={option.label}>
                      {option.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {statusFilter ? (
              <button
                type="button"
                aria-label="状態選択を解除"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-8 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  updateFilters({ statusFilter: null });
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
            variant="outline"
            onPress={() =>
              setQuery(
                {
                  pageParam: 1,
                  nameFilter: null,
                  emailFilter: null,
                  adminFilter: null,
                  statusFilter: null,
                },
                { limitUrlUpdates: undefined },
              )
            }
          >
            条件をクリア
          </Button>
        </div>
      </div>
    </Surface>
  );
}
