import { Checkbox } from "@heroui/react";
import type {
  LessonPeriodListItemFragment,
  OpeningScheduleDayInput,
  OpeningScheduleDayViewFragment,
} from "~/generated/graphql";

const weekdays = ["日", "月", "火", "水", "木", "金", "土"] as const;

export type OpeningPeriodDraft = {
  isEnabled: boolean;
  lessonPeriodId: string;
};

export type OpeningDayDraft = {
  isOpen: boolean;
  periods: OpeningPeriodDraft[];
  weekday: number;
};

// 画面の時限軸と既存詳細から、曜日編集で扱う draft を作る。
export function createOpeningDays(
  lessonPeriods: LessonPeriodListItemFragment[],
  source?: Array<OpeningScheduleDayViewFragment | null | undefined> | null,
): OpeningDayDraft[] {
  const sourceByWeekday = new Map((source ?? []).flatMap((day) => (day ? [[day.weekday, day]] : [])));

  return weekdays.map((_, weekday) => {
    const sourceDay = sourceByWeekday.get(weekday);
    const sourcePeriods = new Set(
      (sourceDay?.periods ?? []).flatMap((period) => (period?.lessonPeriodId ? [period.lessonPeriodId] : [])),
    );

    return {
      weekday,
      isOpen: Boolean(sourceDay?.isOpen),
      periods: lessonPeriods.flatMap((lessonPeriod) => {
        if (!lessonPeriod.id) return [];
        return [
          {
            lessonPeriodId: lessonPeriod.id,
            isEnabled: sourcePeriods.has(lessonPeriod.id),
          },
        ];
      }),
    };
  });
}

// draft から GraphQL mutation が受け取る曜日入力だけを切り出す。
export function toOpeningDayInputs(days: OpeningDayDraft[]): OpeningScheduleDayInput[] {
  return days.map((day) => ({
    weekday: day.weekday,
    isOpen: day.isOpen,
    periods: day.isOpen
      ? day.periods
          .filter((period) => period.isEnabled)
          .map((period) => ({
            lessonPeriodId: period.lessonPeriodId,
          }))
      : [],
  }));
}

export function OpeningScheduleEditor({
  days,
  lessonPeriods,
  onChange,
}: {
  days: OpeningDayDraft[];
  lessonPeriods: LessonPeriodListItemFragment[];
  onChange: (days: OpeningDayDraft[]) => void;
}) {
  // 曜日単位の開校状態を切り替える。
  const updateDay = (weekday: number, patch: Partial<OpeningDayDraft>) => {
    onChange(days.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day)));
  };

  // 曜日内の時限 ON/OFF を更新する。
  const updatePeriod = (weekday: number, lessonPeriodId: string, isEnabled: boolean) => {
    onChange(
      days.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              periods: day.periods.map((period) =>
                period.lessonPeriodId === lessonPeriodId ? { ...period, isEnabled } : period,
              ),
            }
          : day,
      ),
    );
  };

  return (
    <div className="space-y-3">
      {days.map((day) => (
        <section
          key={day.weekday}
          className="rounded-lg border border-separator/70 bg-surface px-4 py-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">{weekdays[day.weekday]}曜日</h3>
            <Checkbox.Root
              isSelected={day.isOpen}
              onChange={(checked) => updateDay(day.weekday, { isOpen: checked })}
            >
              <Checkbox.Control className="border-border bg-default-50 text-primary">
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>開校</Checkbox.Content>
            </Checkbox.Root>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {day.periods.map((period) => {
              const lessonPeriod = lessonPeriods.find((item) => item.id === period.lessonPeriodId);
              return (
                <Checkbox.Root
                  key={`${day.weekday}-${period.lessonPeriodId}`}
                  isDisabled={!day.isOpen}
                  isSelected={period.isEnabled}
                  onChange={(checked) => updatePeriod(day.weekday, period.lessonPeriodId, checked)}
                >
                  <Checkbox.Control className="border-border bg-default-50 text-primary">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>{lessonPeriod?.name ?? period.lessonPeriodId}</Checkbox.Content>
                </Checkbox.Root>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
