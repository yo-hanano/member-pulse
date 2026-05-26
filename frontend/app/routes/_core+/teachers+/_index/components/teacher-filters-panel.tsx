import { Button, Input, ListBox, Select, Surface } from "@heroui/react";
import { X } from "lucide-react";
import type { Key } from "react";

import { useMasterGenders, useMasterSchoolGrades } from "~/hooks/useMasterData";
import { teacherStatusOptions } from "~/routes/_core+/teachers+/_index/teacher-status";

interface Props {
  code: string | null;
  name: string | null;
  kana: string | null;
  genderCode: string | null;
  schoolName: string | null;
  schoolGradeCode: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  onFilterChange: (updates: Record<string, string | null>) => void;
}

// 講師一覧のフィルタ入力UIを表示し、変更内容を親へ通知する。
export function TeacherFiltersPanel({
  code,
  name,
  kana,
  genderCode,
  schoolName,
  schoolGradeCode,
  phone,
  email,
  status,
  onFilterChange,
}: Props) {
  const { data: genders } = useMasterGenders();
  const { data: schoolGrades } = useMasterSchoolGrades();
  const fieldLabelClassName = "app-filter-label";
  const codeFieldClassName = "app-filter-field-sm";
  const shortFieldClassName = "app-filter-field-sm";
  const mediumFieldClassName = "app-filter-field-md";
  const emailFieldClassName = "app-filter-field-lg";
  const genderTriggerClassName = genderCode ? "app-filter-field-xs pr-14" : "app-filter-field-xs";
  const schoolGradeTriggerClassName = schoolGradeCode ? "app-filter-field-sm pr-14" : "app-filter-field-sm";
  const statusTriggerClassName = status ? "app-filter-field-sm pr-14" : "app-filter-field-sm";

  return (
    <Surface className="app-form-surface">
      <div className="app-filter-panel">
        <div className="app-filter-group">
          <p className={fieldLabelClassName}>講師NO</p>
          <Input
            className={codeFieldClassName}
            aria-label="講師NOで絞り込み"
            placeholder="講師NO"
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
          <p className={fieldLabelClassName}>性別</p>
          <div className="relative">
            <Select
              variant="secondary"
              aria-label="性別で絞り込み"
              value={genderCode || null}
              onChange={(key: Key | Key[] | null) => onFilterChange({ genderCode: key ? String(key) : null, page: "1" })}
            >
              <Select.Trigger className={genderTriggerClassName}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="app-select-popover">
                <ListBox>
                  <ListBox.Item id="" key="all-gender" textValue="すべて">
                    すべて
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  {(genders ?? []).map((gender) => (
                    <ListBox.Item id={gender.code ?? ""} key={gender.code ?? ""} textValue={gender.name ?? gender.code ?? ""}>
                      {gender.name ?? gender.code}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {genderCode ? (
              <button
                type="button"
                aria-label="性別選択を解除"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-8 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onFilterChange({ genderCode: null, page: "1" });
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
                  <ListBox.Item id="" key="all-grade" textValue="すべて">
                    すべて
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
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
          <p className={fieldLabelClassName}>電話番号</p>
          <Input
            className={mediumFieldClassName}
            aria-label="電話番号で絞り込み"
            placeholder="電話番号"
            variant="secondary"
            value={phone ?? ""}
            onChange={(event) => onFilterChange({ phone: event.target.value || null, page: "1" })}
          />
        </div>

        <div className="app-filter-group">
          <p className={fieldLabelClassName}>メールアドレス</p>
          <Input
            className={emailFieldClassName}
            aria-label="メールアドレスで絞り込み"
            placeholder="メールアドレス"
            variant="secondary"
            value={email ?? ""}
            onChange={(event) => onFilterChange({ email: event.target.value || null, page: "1" })}
          />
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
                  <ListBox.Item id="" key="all-status" textValue="すべて">
                    すべて
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  {teacherStatusOptions.map((option) => (
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
            onPress={() =>
              onFilterChange({
                code: null,
                name: null,
                kana: null,
                genderCode: null,
                schoolName: null,
                schoolGradeCode: null,
                phone: null,
                email: null,
                status: null,
                page: "1",
              })
            }
          >
            条件をクリア
          </Button>
        </div>
      </div>
    </Surface>
  );
}
