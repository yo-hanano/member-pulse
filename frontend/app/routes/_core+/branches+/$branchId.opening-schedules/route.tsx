import { Breadcrumbs, Button, Input, Label, Table } from "@heroui/react";
import { Clock, Download, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { type LoaderFunctionArgs, useLoaderData, useRevalidator } from "react-router";
import {
  createOpeningDays,
  OpeningScheduleEditor,
  type OpeningDayDraft,
  toOpeningDayInputs,
} from "~/components/opening-schedule/opening-schedule-editor";
import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

type TimeDraft = {
  endTime: string;
  lessonPeriodId: string;
  startTime: string;
};

// 拠点開校スケジュール画面に必要な拠点、時限、テンプレート、時刻セットを取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const branchId = String(params.branchId);
  const sdk = getSdk(getGraphQLClient());
  const [
    { branchById },
    { branchOpeningSchedules },
    { allBranchOpeningScheduleTemplates },
    { allLessonPeriods },
    { branchLessonPeriodTimeSets },
  ] = await Promise.all([
    sdk.branchById({ branchId }),
    sdk.branchOpeningSchedules({ branchId }),
    sdk.allBranchOpeningScheduleTemplates(),
    sdk.allLessonPeriods(),
    sdk.branchLessonPeriodTimeSets({ branchId }),
  ]);

  return {
    branch: branchById,
    schedules: (branchOpeningSchedules ?? []).flatMap((schedule) => (schedule?.id ? [schedule] : [])),
    templates: (allBranchOpeningScheduleTemplates ?? []).flatMap((template) => (template?.id ? [template] : [])),
    lessonPeriods: (allLessonPeriods ?? []).flatMap((period) => (period?.id ? [period] : [])),
    timeSets: (branchLessonPeriodTimeSets ?? []).flatMap((timeSet) => (timeSet?.id ? [timeSet] : [])),
  };
};

// 拠点で利用する通常開校スケジュールと時限時刻セットを管理する画面。
export default function BranchOpeningSchedulesRoute() {
  const { branch, schedules, templates, lessonPeriods, timeSets } = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();
  const today = new Date().toISOString().slice(0, 10);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState(today);
  const [effectiveTo, setEffectiveTo] = useState("");
  const [timeSetId, setTimeSetId] = useState("");
  const [note, setNote] = useState("");
  const [days, setDays] = useState<OpeningDayDraft[]>(() => createOpeningDays(lessonPeriods));
  const [editingTimeSetId, setEditingTimeSetId] = useState<string | null>(null);
  const [timeSetName, setTimeSetName] = useState("");
  const [timeSetNote, setTimeSetNote] = useState("");
  const [times, setTimes] = useState<TimeDraft[]>(() => createEmptyTimes(lessonPeriods));
  const [importTemplateId, setImportTemplateId] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [updateTemplateId, setUpdateTemplateId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 新規スケジュール入力へ戻る。
  const resetSchedule = () => {
    setScheduleId(null);
    setEffectiveFrom(today);
    setEffectiveTo("");
    setTimeSetId("");
    setNote("");
    setDays(createOpeningDays(lessonPeriods));
    setError(null);
  };

  // 新規時刻セット入力へ戻る。
  const resetTimeSet = () => {
    setEditingTimeSetId(null);
    setTimeSetName("");
    setTimeSetNote("");
    setTimes(createEmptyTimes(lessonPeriods));
  };

  // 保存済みスケジュール詳細を編集状態へ読み込む。
  const loadSchedule = async (id: string) => {
    setIsSaving(true);
    setError(null);
    try {
      const { branchOpeningScheduleById } =
        await getSdk(getGraphQLClient()).branchOpeningScheduleById({ scheduleId: id });
      if (!branchOpeningScheduleById) return;
      setScheduleId(id);
      setEffectiveFrom(branchOpeningScheduleById.effectiveFrom ?? today);
      setEffectiveTo(branchOpeningScheduleById.effectiveTo ?? "");
      setTimeSetId(branchOpeningScheduleById.timeSetId ?? "");
      setNote(branchOpeningScheduleById.note ?? "");
      setDays(createOpeningDays(lessonPeriods, branchOpeningScheduleById.days));
    } catch {
      setError("開校スケジュール詳細を取得できませんでした。");
    } finally {
      setIsSaving(false);
    }
  };

  // 保存済み時刻セット詳細を編集状態へ読み込む。
  const loadTimeSet = async (id: string) => {
    setIsSaving(true);
    setError(null);
    try {
      const { branchLessonPeriodTimeSetById } =
        await getSdk(getGraphQLClient()).branchLessonPeriodTimeSetById({ timeSetId: id });
      if (!branchLessonPeriodTimeSetById) return;
      const source = new Map(
        (branchLessonPeriodTimeSetById.times ?? []).flatMap((time) =>
          time?.lessonPeriodId ? [[time.lessonPeriodId, time]] : [],
        ),
      );
      setEditingTimeSetId(id);
      setTimeSetName(branchLessonPeriodTimeSetById.name ?? "");
      setTimeSetNote(branchLessonPeriodTimeSetById.note ?? "");
      setTimes(
        lessonPeriods.flatMap((period) =>
          period.id
            ? [
                {
                  lessonPeriodId: period.id,
                  startTime: source.get(period.id)?.startTime ?? "",
                  endTime: source.get(period.id)?.endTime ?? "",
                },
              ]
            : [],
        ),
      );
    } catch {
      setError("時刻セット詳細を取得できませんでした。");
    } finally {
      setIsSaving(false);
    }
  };

  // 選択テンプレートを現在の曜日入力へコピーする。
  const importTemplate = async () => {
    if (!importTemplateId) return;
    setIsSaving(true);
    setError(null);
    try {
      const { branchOpeningScheduleTemplateById } =
        await getSdk(getGraphQLClient()).branchOpeningScheduleTemplateById({ templateId: importTemplateId });
      if (branchOpeningScheduleTemplateById) {
        setDays(createOpeningDays(lessonPeriods, branchOpeningScheduleTemplateById.days));
      }
    } catch {
      setError("テンプレートを取り込めませんでした。");
    } finally {
      setIsSaving(false);
    }
  };

  // 拠点スケジュール親子を保存する。
  const saveSchedule = async () => {
    if (!branch?.id || !effectiveFrom) {
      setError("適用開始日を入力してください。");
      return;
    }
    setIsSaving(true);
    setError(null);
    const input = {
      branchId: branch.id,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      timeSetId: timeSetId || null,
      note: note.trim() || null,
      days: toOpeningDayInputs(days),
    };
    try {
      const sdk = getSdk(getGraphQLClient());
      if (scheduleId) {
        await sdk.updateBranchOpeningSchedule({ scheduleId, input });
      } else {
        await sdk.createBranchOpeningSchedule({ input });
      }
      resetSchedule();
      revalidator.revalidate();
    } catch {
      setError("開校スケジュールを保存できませんでした。期間の重複を確認してください。");
    } finally {
      setIsSaving(false);
    }
  };

  // 拠点の時刻セットを保存する。
  const saveTimeSet = async () => {
    if (!branch?.id || !timeSetName.trim()) {
      setError("時刻セット名を入力してください。");
      return;
    }
    const enabledTimes = times.filter((time) => time.startTime && time.endTime);
    setIsSaving(true);
    setError(null);
    try {
      const sdk = getSdk(getGraphQLClient());
      const input = {
        branchId: branch.id,
        name: timeSetName.trim(),
        note: timeSetNote.trim() || null,
        times: enabledTimes.map((time) => ({
          lessonPeriodId: time.lessonPeriodId,
          startTime: time.startTime,
          endTime: time.endTime,
        })),
      };
      if (editingTimeSetId) {
        await sdk.updateBranchLessonPeriodTimeSet({ timeSetId: editingTimeSetId, input });
      } else {
        await sdk.createBranchLessonPeriodTimeSet({ input });
      }
      resetTimeSet();
      revalidator.revalidate();
    } catch {
      setError("時刻セットを保存できませんでした。時刻の前後関係と重複を確認してください。");
    } finally {
      setIsSaving(false);
    }
  };

  // 時刻セットを論理削除する。
  const deleteTimeSet = async (id: string) => {
    setIsSaving(true);
    setError(null);
    try {
      await getSdk(getGraphQLClient()).deleteBranchLessonPeriodTimeSet({ timeSetId: id });
      if (editingTimeSetId === id) resetTimeSet();
      revalidator.revalidate();
    } catch {
      setError("時刻セットを削除できませんでした。利用中のスケジュールがないか確認してください。");
    } finally {
      setIsSaving(false);
    }
  };

  // 拠点設定を新規テンプレートとして保存する。
  const createTemplate = async () => {
    if (!newTemplateName.trim()) {
      setError("新規テンプレート名を入力してください。");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await getSdk(getGraphQLClient()).createBranchOpeningScheduleTemplate({
        input: { name: newTemplateName.trim(), note: note.trim() || null, days: toOpeningDayInputs(days) },
      });
      setNewTemplateName("");
      revalidator.revalidate();
    } catch {
      setError("テンプレートを新規保存できませんでした。");
    } finally {
      setIsSaving(false);
    }
  };

  // 拠点設定で既存テンプレートを明示的に更新する。
  const updateTemplate = async () => {
    const target = templates.find((template) => template.id === updateTemplateId);
    if (!target?.id || !target.name) {
      setError("更新先テンプレートを選択してください。");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await getSdk(getGraphQLClient()).updateBranchOpeningScheduleTemplate({
        templateId: target.id,
        input: { name: target.name, note: target.note ?? null, days: toOpeningDayInputs(days) },
      });
      revalidator.revalidate();
    } catch {
      setError("既存テンプレートを更新できませんでした。");
    } finally {
      setIsSaving(false);
    }
  };

  // 期間履歴から対象スケジュールを論理削除する。
  const deleteSchedule = async (id: string) => {
    setIsSaving(true);
    setError(null);
    try {
      await getSdk(getGraphQLClient()).deleteBranchOpeningSchedule({ scheduleId: id });
      if (scheduleId === id) resetSchedule();
      revalidator.revalidate();
    } catch {
      setError("開校スケジュールを削除できませんでした。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Breadcrumbs className="mb-3 text-sm text-muted-foreground">
            <Breadcrumbs.Item href="/">ホーム</Breadcrumbs.Item>
            <Breadcrumbs.Item href="/branches">拠点</Breadcrumbs.Item>
            <Breadcrumbs.Item className="text-foreground">開校スケジュール</Breadcrumbs.Item>
          </Breadcrumbs>
          <h1 className="text-xl font-semibold">{branch?.name ?? "拠点"} 開校スケジュール</h1>
        </div>
        <Button variant="outline" onPress={resetSchedule}>
          <Plus className="size-4" />
          新規期間
        </Button>
      </div>

      {error ? <p className="text-danger text-sm">{error}</p> : null}

      <div className="grid gap-5 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Table className="bg-surface">
            <Table.ScrollContainer>
              <Table.Content aria-label="branch opening schedules table">
                <Table.Header>
                  <Table.Column id="period" isRowHeader>適用期間</Table.Column>
                  <Table.Column id="actions">操作</Table.Column>
                </Table.Header>
                <Table.Body>
                  {schedules.length === 0 ? (
                    <Table.Row id="empty"><Table.Cell colSpan={2}>データはありません</Table.Cell></Table.Row>
                  ) : (
                    schedules.flatMap((schedule) =>
                      schedule.id
                        ? [
                            <Table.Row id={schedule.id} key={schedule.id}>
                              <Table.Cell>{schedule.effectiveFrom} - {schedule.effectiveTo ?? ""}</Table.Cell>
                              <Table.Cell>
                                <div className="flex justify-end gap-1">
                                  <Button isIconOnly size="sm" variant="ghost" onPress={() => void loadSchedule(String(schedule.id))}>
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button isIconOnly size="sm" variant="ghost" onPress={() => void deleteSchedule(String(schedule.id))}>
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </Table.Cell>
                            </Table.Row>,
                          ]
                        : [],
                    )
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>

          <section className="space-y-2 border-y border-separator/70 py-4">
            <div className="flex items-center justify-between gap-2">
              <Label>時刻セット</Label>
              <Button size="sm" variant="outline" onPress={resetTimeSet}>
                <Plus className="size-4" />
                新規
              </Button>
            </div>
            <div className="space-y-2">
              {timeSets.length === 0 ? <p className="text-muted-foreground text-sm">データはありません</p> : null}
              {timeSets.map((set) =>
                set.id ? (
                  <div key={set.id} className="flex items-center justify-between gap-2 rounded-md border border-separator/70 px-3 py-2">
                    <span className="min-w-0 truncate text-sm">{set.name}</span>
                    <div className="flex gap-1">
                      <Button isIconOnly size="sm" variant="ghost" onPress={() => void loadTimeSet(String(set.id))}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button isIconOnly size="sm" variant="ghost" onPress={() => void deleteTimeSet(String(set.id))}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          </section>

          <div className="space-y-2 border-y border-separator/70 py-4">
            <Label>テンプレート取り込み</Label>
            <select className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" value={importTemplateId} onChange={(event) => setImportTemplateId(event.currentTarget.value)}>
              <option value="">選択してください</option>
              {templates.flatMap((template) => template.id ? [<option key={template.id} value={template.id}>{template.name}</option>] : [])}
            </select>
            <Button isDisabled={!importTemplateId} variant="outline" onPress={() => void importTemplate()}>
              <Download className="size-4" />
              取り込む
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <section className="space-y-3 border-y border-separator/70 py-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <h2 className="text-sm font-semibold">時刻セット編集</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label isRequired>時刻セット名</Label>
                <Input value={timeSetName} onChange={(event) => setTimeSetName(event.currentTarget.value)} />
              </div>
              <div className="space-y-1">
                <Label>備考</Label>
                <Input value={timeSetNote} onChange={(event) => setTimeSetNote(event.currentTarget.value)} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {times.map((time) => {
                const lessonPeriod = lessonPeriods.find((period) => period.id === time.lessonPeriodId);
                return (
                  <div key={time.lessonPeriodId} className="grid grid-cols-[80px_1fr_1fr] items-end gap-2">
                    <span className="pb-2 text-sm">{lessonPeriod?.name ?? time.lessonPeriodId}</span>
                    <Input aria-label={`${lessonPeriod?.name ?? "時限"} 開始時刻`} type="time" value={time.startTime} onChange={(event) => setTimes(updateTimeDraft(times, time.lessonPeriodId, { startTime: event.currentTarget.value }))} />
                    <Input aria-label={`${lessonPeriod?.name ?? "時限"} 終了時刻`} type="time" value={time.endTime} onChange={(event) => setTimes(updateTimeDraft(times, time.lessonPeriodId, { endTime: event.currentTarget.value }))} />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" isPending={isSaving} onPress={() => void saveTimeSet()}>
                <Save className="size-4" />
                {editingTimeSetId ? "時刻セット更新" : "時刻セット保存"}
              </Button>
              {editingTimeSetId ? <Button variant="outline" onPress={resetTimeSet}>編集解除</Button> : null}
            </div>
          </section>

          <div className="grid gap-3 border-y border-separator/70 py-4 md:grid-cols-4">
            <div className="space-y-1">
              <Label isRequired>適用開始日</Label>
              <Input type="date" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.currentTarget.value)} />
            </div>
            <div className="space-y-1">
              <Label>適用終了日</Label>
              <Input type="date" value={effectiveTo} onChange={(event) => setEffectiveTo(event.currentTarget.value)} />
            </div>
            <div className="space-y-1">
              <Label>時刻セット</Label>
              <select className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" value={timeSetId} onChange={(event) => setTimeSetId(event.currentTarget.value)}>
                <option value="">未選択</option>
                {timeSets.flatMap((set) => set.id ? [<option key={set.id} value={set.id}>{set.name}</option>] : [])}
              </select>
            </div>
            <div className="space-y-1">
              <Label>備考</Label>
              <Input value={note} onChange={(event) => setNote(event.currentTarget.value)} />
            </div>
            <div className="flex flex-wrap items-end gap-2 md:col-span-4">
              <Button className="app-primary-button" isPending={isSaving} onPress={() => void saveSchedule()}>
                <Save className="size-4" />
                {scheduleId ? "更新" : "保存"}
              </Button>
              {scheduleId ? <Button variant="outline" onPress={resetSchedule}>編集解除</Button> : null}
            </div>
          </div>

          <OpeningScheduleEditor days={days} lessonPeriods={lessonPeriods} onChange={setDays} />

          <section className="grid gap-3 border-y border-separator/70 py-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>新規テンプレートとして保存</Label>
              <div className="flex gap-2">
                <Input value={newTemplateName} onChange={(event) => setNewTemplateName(event.currentTarget.value)} />
                <Button variant="outline" onPress={() => void createTemplate()}>保存</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>既存テンプレートを更新</Label>
              <div className="flex gap-2">
                <select className="h-10 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm" value={updateTemplateId} onChange={(event) => setUpdateTemplateId(event.currentTarget.value)}>
                  <option value="">選択してください</option>
                  {templates.flatMap((template) => template.id ? [<option key={template.id} value={template.id}>{template.name}</option>] : [])}
                </select>
                <Button variant="outline" onPress={() => void updateTemplate()}>更新</Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

// 時限マスタに対応した空の時刻セット draft を作る。
function createEmptyTimes(lessonPeriods: Array<{ id?: string | null }>): TimeDraft[] {
  return lessonPeriods.flatMap((period) =>
    period.id ? [{ lessonPeriodId: period.id, startTime: "", endTime: "" }] : [],
  );
}

// 時刻セット draft の対象時限だけを更新する。
function updateTimeDraft(times: TimeDraft[], lessonPeriodId: string, patch: Partial<TimeDraft>): TimeDraft[] {
  return times.map((time) => (time.lessonPeriodId === lessonPeriodId ? { ...time, ...patch } : time));
}
