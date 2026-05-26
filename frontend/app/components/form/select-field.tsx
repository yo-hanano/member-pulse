import { EmptyState, Label, ListBox, SearchField, Select } from "@heroui/react";
import type { ReactNode } from "react";

interface SelectFieldItem {
  id: string;
  textValue: string;
  content: ReactNode;
}

interface Props {
  label: string;
  ariaLabel: string;
  value: string | null;
  onChange: (value: string) => void;
  items: SelectFieldItem[];
  isRequired?: boolean;
  className?: string;
  popoverClassName?: string;
  searchable?: boolean;
  searchFieldName?: string;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyState?: ReactNode;
}

// ラベル、検索欄、候補一覧をまとめた再利用可能な選択フィールド。
export function SelectField({
  label,
  ariaLabel,
  value,
  onChange,
  items,
  isRequired = false,
  className = "space-y-1",
  popoverClassName = "w-[var(--trigger-width)] min-w-[280px] p-0",
  searchable = false,
  searchFieldName = "search",
  searchValue = "",
  onSearchValueChange,
  searchPlaceholder,
  emptyState,
}: Props) {
  // 検索付きの場合だけ、候補一覧の上に検索欄を表示する。
  const searchInput = searchable ? (
    <div className="border-border/60 border-b p-2">
      <SearchField autoFocus name={searchFieldName} variant="secondary">
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => {
              onSearchValueChange?.(event.currentTarget.value);
            }}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
    </div>
  ) : null;

  return (
    <div className={className}>
      <Select
        aria-label={ariaLabel}
        isRequired={isRequired}
        value={value ?? null}
        onChange={(key) => {
          onChange(String(key ?? ""));
        }}
      >
        <Label className="block" isRequired={isRequired}>
          {label}
        </Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover className={popoverClassName}>
          {searchInput}
          <ListBox
            renderEmptyState={() => {
              if (!emptyState) return null;
              return <EmptyState>{emptyState}</EmptyState>;
            }}
          >
            {items.map((item) => (
              <ListBox.Item id={item.id} key={item.id} textValue={item.textValue}>
                {item.content}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
