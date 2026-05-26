import { Button, Input, ListBox, Select, Surface } from "@heroui/react";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import type { Key } from "react";

import type { LeadOptionFragment } from "~/generated/graphql";
import { buildChangedQueryPatch } from "~/lib/query-state";
import { useScheduleEventMasterOptions } from "~/routes/_core+/schedule-events+/_index/hooks/useScheduleEventMasterOptions";
import {
  scheduleEventQueryParsers,
  scheduleEventQueryUrlKeys,
} from "~/routes/_core+/schedule-events+/_index/query-state";
import {
  formatScheduleEventLeadLabel,
  scheduleEventTypeOptions,
} from "~/routes/_core+/schedule-events+/_index/schedule-event-options";

interface Props {
  leads: LeadOptionFragment[];
}

// 訪問・来塾予定一覧のフィルタ入力UIを表示し、変更内容を URL に反映する。
export function ScheduleEventFiltersPanel({ leads }: Props) {
  const [{ leadIdFilter, activityTypeFilter, noteFilter }, setQuery] = useQueryStates(
    scheduleEventQueryParsers,
    {
      urlKeys: scheduleEventQueryUrlKeys,
    },
  );
  const { typeOptions } = useScheduleEventMasterOptions();

  // フィルタ変更時は 1 ページ目へ戻す。
  const updateFilters = (updates: {
    leadIdFilter?: string | null;
    activityTypeFilter?: string | null;
    noteFilter?: string | null;
  }) => {
    const applyImmediately = updates.leadIdFilter === null || updates.activityTypeFilter === null;

    setQuery(
      buildChangedQueryPatch(updates),
      applyImmediately ? { limitUrlUpdates: undefined } : undefined,
    );
  };

  const fieldLabelClassName = "app-filter-label";
  const leadTriggerClassName = leadIdFilter ? "app-filter-field-lg pr-14" : "app-filter-field-lg";
  const activityTypeTriggerClassName = activityTypeFilter
    ? "app-filter-field-sm pr-14"
    : "app-filter-field-sm";
  const noteFieldClassName = "app-filter-field-md";
  const activityTypeItems =
    typeOptions.length > 0
      ? typeOptions.map((option) => ({
          id: option.code ?? "",
          label: option.name ?? option.code ?? "",
        }))
      : scheduleEventTypeOptions.map((option) => ({
          id: option.value,
          label: option.label,
        }));
  const leadItems = leads
    .filter((lead) => lead.id != null)
    .map((lead) => ({
      id: String(lead.id),
      label: formatScheduleEventLeadLabel(lead),
    }));

  return (
    <Surface className="app-form-surface">
      <div className="app-filter-panel">
        <div className="app-filter-group">
          <p className={fieldLabelClassName}>リード</p>
          <div className="relative">
            <Select
              variant="secondary"
              aria-label="リードで絞り込み"
              value={leadIdFilter || null}
              onChange={(key: Key | Key[] | null) =>
                updateFilters({ leadIdFilter: key ? String(key) : null })
              }
            >
              <Select.Trigger className={leadTriggerClassName}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="app-select-popover">
                <ListBox>
                  {leadItems.map((lead) => (
                    <ListBox.Item id={lead.id} key={lead.id} textValue={lead.label}>
                      {lead.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {leadIdFilter ? (
              <button
                type="button"
                aria-label="リード選択を解除"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-8 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  updateFilters({ leadIdFilter: null });
                }}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>予定種別</p>
          <div className="relative">
            <Select
              variant="secondary"
              aria-label="予定種別で絞り込み"
              value={activityTypeFilter || null}
              onChange={(key: Key | Key[] | null) =>
                updateFilters({ activityTypeFilter: key ? String(key) : null })
              }
            >
              <Select.Trigger className={activityTypeTriggerClassName}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="app-select-popover">
                <ListBox>
                  {activityTypeItems.map((option) => (
                    <ListBox.Item id={option.id} key={option.id} textValue={option.label}>
                      {option.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {activityTypeFilter ? (
              <button
                type="button"
                aria-label="予定種別選択を解除"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-8 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  updateFilters({ activityTypeFilter: null });
                }}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>メモ</p>
          <Input
            className={noteFieldClassName}
            aria-label="メモで絞り込み"
            placeholder="メモ"
            variant="secondary"
            value={noteFilter ?? ""}
            onChange={(event) => updateFilters({ noteFilter: event.target.value || null })}
          />
        </div>

        <div className="app-filter-actions">
          <Button
            className="app-primary-button app-primary-button-compact"
            variant="outline"
            onPress={() =>
              setQuery(
                {
                  pageParam: 1,
                  leadIdFilter: null,
                  activityTypeFilter: null,
                  noteFilter: null,
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
