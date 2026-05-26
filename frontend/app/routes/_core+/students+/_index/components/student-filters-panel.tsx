import { Button, Input, ListBox, Select, Surface } from "@heroui/react";
import { X } from "lucide-react";
import type { Key } from "react";

import { useMasterBranches, useMasterSchoolGrades, useMasterSchoolTypes } from "~/hooks/useMasterData";
import { studentStatusOptions } from "~/routes/_core+/students+/_index/student-status";

interface Props {
  code: string | null;
  name: string | null;
  kana: string | null;
  branchId: string | null;
  schoolName: string | null;
  schoolTypeCode: string | null;
  schoolGradeCode: string | null;
  status: string | null;
  onFilterChange: (updates: Record<string, string | null>) => void;
}

// 生徒一覧のフィルタ入力UIを表示し、変更内容を親へ通知する。
export function StudentFiltersPanel({
  code,
  name,
  kana,
  branchId,
  schoolName,
  schoolTypeCode,
  schoolGradeCode,
  status,
  onFilterChange,
}: Props) {
  const { data: branches } = useMasterBranches();
  const { data: schoolGrades } = useMasterSchoolGrades();
  const { data: schoolTypes } = useMasterSchoolTypes();
  const fieldLabelClassName = "app-filter-label";
  const codeFieldClassName = "app-filter-field-sm";
  const shortFieldClassName = "app-filter-field-sm";
  const mediumFieldClassName = "app-filter-field-md";
  const branchTriggerClassName = branchId ? "app-filter-field-md pr-14" : "app-filter-field-md";
  const schoolTypeTriggerClassName = schoolTypeCode ? "app-filter-field-sm pr-14" : "app-filter-field-sm";
  const schoolGradeTriggerClassName = schoolGradeCode ? "app-filter-field-sm pr-14" : "app-filter-field-sm";
  const statusTriggerClassName = status ? "app-filter-field-sm pr-14" : "app-filter-field-sm";

  return (
    <Surface className="app-form-surface">
      <div className="app-filter-panel">
        <div className="app-filter-group">
          <p className={fieldLabelClassName}>生徒NO</p>
          <Input
            className={codeFieldClassName}
            aria-label="生徒NOで絞り込み"
            placeholder="生徒NO"
            variant="secondary"
            value={code ?? ""}
            onChange={(event) => onFilterChange({ code: event.target.value || null, page: "1" })}
          />
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>名前</p>
          <Input
            className={shortFieldClassName}
            aria-label="名前で絞り込み"
            placeholder="名前"
            variant="secondary"
            value={name ?? ""}
            onChange={(event) => onFilterChange({ name: event.target.value || null, page: "1" })}
          />
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>フリガナ</p>
          <Input
            className={shortFieldClassName}
            aria-label="フリガナで絞り込み"
            placeholder="フリガナ"
            variant="secondary"
            value={kana ?? ""}
            onChange={(event) => onFilterChange({ kana: event.target.value || null, page: "1" })}
          />
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>拠点</p>
          <div className="relative">
            <Select
              variant="secondary"
              aria-label="拠点で絞り込み"
              value={branchId || null}
              onChange={(key: Key | Key[] | null) => onFilterChange({ branchId: key ? String(key) : null, page: "1" })}
            >
              <Select.Trigger className={branchTriggerClassName}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="app-select-popover">
                <ListBox>
                  {(branches ?? []).map((branch) => (
                    <ListBox.Item
                      id={branch.id ?? ""}
                      key={branch.id ?? ""}
                      textValue={branch.name ?? branch.code ?? ""}
                    >
                      {branch.name ?? branch.code}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {branchId ? (
              <button
                type="button"
                aria-label="拠点選択を解除"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-8 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onFilterChange({ branchId: null, page: "1" });
                }}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>学校種</p>
          <div className="relative">
            <Select
              variant="secondary"
              aria-label="学校種で絞り込み"
              value={schoolTypeCode || null}
              onChange={(key: Key | Key[] | null) =>
                onFilterChange({ schoolTypeCode: key ? String(key) : null, page: "1" })
              }
            >
              <Select.Trigger className={schoolTypeTriggerClassName}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="app-select-popover">
                <ListBox>
                  {(schoolTypes ?? []).map((schoolType) => (
                    <ListBox.Item
                      id={schoolType.code ?? ""}
                      key={schoolType.code ?? ""}
                      textValue={schoolType.name ?? schoolType.code ?? ""}
                    >
                      {schoolType.name ?? schoolType.code}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {schoolTypeCode ? (
              <button
                type="button"
                aria-label="学校種選択を解除"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-8 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onFilterChange({ schoolTypeCode: null, page: "1" });
                }}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>所属学校</p>
          <Input
            className={mediumFieldClassName}
            aria-label="所属学校で絞り込み"
            placeholder="所属学校"
            variant="secondary"
            value={schoolName ?? ""}
            onChange={(event) => onFilterChange({ schoolName: event.target.value || null, page: "1" })}
          />
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>学年</p>
          <div className="relative">
            <Select
              variant="secondary"
              aria-label="学年で絞り込み"
              value={schoolGradeCode || null}
              onChange={(key: Key | Key[] | null) =>
                onFilterChange({ schoolGradeCode: key ? String(key) : null, page: "1" })
              }
            >
              <Select.Trigger className={schoolGradeTriggerClassName}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="app-select-popover">
                <ListBox>
                  {(schoolGrades ?? []).map((schoolGrade) => (
                    <ListBox.Item id={schoolGrade.code ?? ""} key={schoolGrade.code ?? ""} textValue={schoolGrade.name ?? ""}>
                      {schoolGrade.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {schoolGradeCode ? (
              <button
                type="button"
                aria-label="学年選択を解除"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-8 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onFilterChange({ schoolGradeCode: null, page: "1" });
                }}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>在籍状態</p>
          <div className="relative">
            <Select
              variant="secondary"
              aria-label="在籍状態で絞り込み"
              value={status || null}
              onChange={(key: Key | Key[] | null) => onFilterChange({ status: key ? String(key) : null, page: "1" })}
            >
              <Select.Trigger className={statusTriggerClassName}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="app-select-popover">
                <ListBox>
                  {studentStatusOptions.map((option) => (
                    <ListBox.Item id={option.value} key={option.value} textValue={option.label}>
                      {option.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {status ? (
              <button
                type="button"
                aria-label="在籍状態選択を解除"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-8 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onFilterChange({ status: null, page: "1" });
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
            onPress={() => onFilterChange({
            code: null,
            name: null,
            kana: null,
            branchId: null,
            schoolName: null,
            schoolTypeCode: null,
            schoolGradeCode: null,
            status: null,
            page: "1",
          })}
          >
            条件をクリア
          </Button>
        </div>
      </div>
    </Surface>
  );
}
