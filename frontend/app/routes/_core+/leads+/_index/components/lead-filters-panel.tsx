import {
  Button,
  DateField,
  DateRangePicker,
  Input,
  Label,
  ListBox,
  RangeCalendar,
  Select,
  Surface,
} from "@heroui/react";
import { type DateValue, parseDate } from "@internationalized/date";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import type { Key } from "react";

import { buildChangedQueryPatch } from "~/lib/query-state";
import { leadStatusOptions } from "~/routes/_core+/leads+/_index/lead-status";
import { leadQueryParsers, leadQueryUrlKeys } from "~/routes/_core+/leads+/_index/query-state";

type InquiryDateRange = {
  start: DateValue;
  end: DateValue;
};

// リード一覧のフィルタ入力UIを表示し、変更内容を URL に反映する。
export function LeadFiltersPanel() {
  const [
    {
      inquiryAtFromFilter,
      inquiryAtToFilter,
      studentNameFilter,
      guardianNameFilter,
      schoolNameFilter,
      channelFilter,
      statusFilter,
    },
    setQuery,
  ] = useQueryStates(leadQueryParsers, {
    urlKeys: leadQueryUrlKeys,
  });

  const inquiryAtRange =
    inquiryAtFromFilter && inquiryAtToFilter
      ? { start: parseDate(inquiryAtFromFilter), end: parseDate(inquiryAtToFilter) }
      : null;

  // フィルタ変更時は 1 ページ目へ戻す。
  const updateFilters = (updates: {
    studentNameFilter?: string | null;
    guardianNameFilter?: string | null;
    schoolNameFilter?: string | null;
    channelFilter?: string | null;
    inquiryAtFromFilter?: string | null;
    inquiryAtToFilter?: string | null;
    branchIdFilter?: string | null;
    statusFilter?: string | null;
  }) => {
    const applyImmediately =
      updates.studentNameFilter === null ||
      updates.guardianNameFilter === null ||
      updates.schoolNameFilter === null ||
      updates.channelFilter === null ||
      updates.inquiryAtFromFilter !== undefined ||
      updates.inquiryAtToFilter !== undefined;

    setQuery(
      buildChangedQueryPatch(updates),
      applyImmediately ? { limitUrlUpdates: undefined } : undefined,
    );
  };

  const fieldLabelClassName = "app-filter-label";
  const dateFieldClassName = "app-filter-field-lg";
  const shortFieldClassName = "app-filter-field-sm";
  const mediumFieldClassName = "app-filter-field-md";
  const statusTriggerClassName = statusFilter ? "app-filter-field-xs pr-14" : "app-filter-field-xs";

  const updateInquiryAtRange = (nextRange: InquiryDateRange | null) => {
    updateFilters({
      inquiryAtFromFilter: nextRange ? nextRange.start.toString() : null,
      inquiryAtToFilter: nextRange ? nextRange.end.toString() : null,
    });
  };

  return (
    <Surface className="app-form-surface">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="app-filter-panel flex-1 gap-x-3">
          <div className="app-filter-group">
            <Label className={fieldLabelClassName}>問合せ日</Label>
            <DateRangePicker
              className="w-full"
              value={inquiryAtRange}
              onChange={(nextRange) => updateInquiryAtRange(nextRange)}
            >
              <DateField.Group className={dateFieldClassName} fullWidth variant="secondary">
                <DateField.Input slot="start">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateRangePicker.RangeSeparator />
                <DateField.Input slot="end">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateField.Suffix>
                  <DateRangePicker.Trigger className="text-foreground hover:bg-default-100 data-[pressed=true]:bg-default-200">
                    <DateRangePicker.TriggerIndicator className="text-foreground" />
                  </DateRangePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>
              <DateRangePicker.Popover className="app-select-popover">
                <RangeCalendar aria-label="問合せ日の範囲">
                  <RangeCalendar.Header>
                    <RangeCalendar.YearPickerTrigger>
                      <RangeCalendar.YearPickerTriggerHeading />
                      <RangeCalendar.YearPickerTriggerIndicator />
                    </RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.NavButton slot="previous" />
                    <RangeCalendar.NavButton slot="next" />
                  </RangeCalendar.Header>
                  <RangeCalendar.Grid>
                    <RangeCalendar.GridHeader>
                      {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                    </RangeCalendar.GridHeader>
                    <RangeCalendar.GridBody>
                      {(date) => <RangeCalendar.Cell date={date} />}
                    </RangeCalendar.GridBody>
                  </RangeCalendar.Grid>
                  <RangeCalendar.YearPickerGrid>
                    <RangeCalendar.YearPickerGridBody>
                      {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
                    </RangeCalendar.YearPickerGridBody>
                  </RangeCalendar.YearPickerGrid>
                </RangeCalendar>
              </DateRangePicker.Popover>
            </DateRangePicker>
          </div>

          <div className="app-filter-group">
            <p className={fieldLabelClassName}>生徒名</p>
            <Input
              className={shortFieldClassName}
              aria-label="生徒名で絞り込み"
              placeholder="生徒名"
              variant="secondary"
              value={studentNameFilter ?? ""}
              onChange={(event) => updateFilters({ studentNameFilter: event.target.value || null })}
            />
          </div>

          <div className="app-filter-group">
            <p className={fieldLabelClassName}>保護者名</p>
            <Input
              className={shortFieldClassName}
              aria-label="保護者名で絞り込み"
              placeholder="保護者名"
              variant="secondary"
              value={guardianNameFilter ?? ""}
              onChange={(event) =>
                updateFilters({ guardianNameFilter: event.target.value || null })
              }
            />
          </div>

          <div className="app-filter-group">
            <p className={fieldLabelClassName}>学校名</p>
            <Input
              className={mediumFieldClassName}
              aria-label="学校名で絞り込み"
              placeholder="学校名"
              variant="secondary"
              value={schoolNameFilter ?? ""}
              onChange={(event) => updateFilters({ schoolNameFilter: event.target.value || null })}
            />
          </div>

          <div className="app-filter-group">
            <p className={fieldLabelClassName}>流入経路</p>
            <Input
              className={shortFieldClassName}
              aria-label="流入経路で絞り込み"
              placeholder="流入経路"
              variant="secondary"
              value={channelFilter ?? ""}
              onChange={(event) => updateFilters({ channelFilter: event.target.value || null })}
            />
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
                    {leadStatusOptions.map((option) => (
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
        </div>

        <div className="app-filter-actions">
          <Button
            className="app-primary-button app-primary-button-compact"
            onPress={() =>
              setQuery(
                {
                  pageParam: 1,
                  studentNameFilter: null,
                  guardianNameFilter: null,
                  schoolNameFilter: null,
                  channelFilter: null,
                  inquiryAtFromFilter: null,
                  inquiryAtToFilter: null,
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
