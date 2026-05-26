import { Autocomplete, EmptyState, Label, ListBox, SearchField } from "@heroui/react";
import type { ReactNode } from "react";

interface AutocompleteFieldItem {
  id: string;
  textValue: string;
  content: ReactNode;
}

interface Props {
  label: string;
  ariaLabel: string;
  value: string | null;
  onChange: (value: string) => void;
  items: AutocompleteFieldItem[];
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  searchPlaceholder: string;
  emptyState: ReactNode;
  filter: (textValue: string, inputValue: string) => boolean;
  isRequired?: boolean;
  className?: string;
  labelClassName?: string;
  popoverClassName?: string;
  searchFieldName?: string;
  selectedValue?: ReactNode;
  valueClassName?: string;
  variant?: "primary" | "secondary";
}

type AutocompleteValueRenderProps = {
  defaultChildren: ReactNode;
  isPlaceholder: boolean;
};

// 検索欄付きの Autocomplete を共通化したフォーム部品。
export function AutocompleteField({
  label,
  ariaLabel,
  value,
  onChange,
  items,
  searchValue,
  onSearchValueChange,
  searchPlaceholder,
  emptyState,
  filter,
  isRequired = false,
  className = "space-y-1",
  labelClassName = "block",
  popoverClassName = "w-[var(--trigger-width)] min-w-[320px] p-0",
  searchFieldName = "search",
  selectedValue,
  valueClassName,
  variant = "primary",
}: Props) {
  return (
    <div className={className}>
      <Autocomplete
        allowsEmptyCollection
        aria-label={ariaLabel}
        className="w-full"
        isRequired={isRequired}
        variant={variant}
        value={value ?? null}
        onChange={(key) => {
          onChange(String(key ?? ""));
        }}
      >
        <Label className={labelClassName} isRequired={isRequired}>
          {label}
        </Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value className={valueClassName}>
            {selectedValue == null
              ? undefined
              : ({ defaultChildren, isPlaceholder }: AutocompleteValueRenderProps) =>
                  isPlaceholder ? defaultChildren : selectedValue}
          </Autocomplete.Value>
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover className={popoverClassName}>
          <Autocomplete.Filter filter={filter}>
            <SearchField autoFocus name={searchFieldName} variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(event) => {
                    onSearchValueChange(event.currentTarget.value);
                  }}
                />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ListBox
              renderEmptyState={() => {
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
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>
    </div>
  );
}
