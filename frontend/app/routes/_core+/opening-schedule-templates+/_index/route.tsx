import { Breadcrumbs, Button, Input, Label, Table } from "@heroui/react";
import { CopyPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import {
  createOpeningDays,
  OpeningScheduleEditor,
  type OpeningDayDraft,
  toOpeningDayInputs,
} from "~/components/opening-schedule/opening-schedule-editor";
import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// テンプレート編集に必要な一覧と時限軸を取得する。
export const clientLoader = async () => {
  const sdk = getSdk(getGraphQLClient());
  const [{ allBranchOpeningScheduleTemplates }, { allLessonPeriods }] = await Promise.all([
    sdk.allBranchOpeningScheduleTemplates(),
    sdk.allLessonPeriods(),
  ]);
  return {
    templates: (allBranchOpeningScheduleTemplates ?? []).flatMap((template) => (template?.id ? [template] : [])),
    lessonPeriods: (allLessonPeriods ?? []).flatMap((period) => (period?.id ? [period] : [])),
  };
};

// 会社別の開校スケジュールテンプレートを管理する画面。
export default function OpeningScheduleTemplatesIndexRoute() {
  const { templates, lessonPeriods } = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [days, setDays] = useState<OpeningDayDraft[]>(() => createOpeningDays(lessonPeriods));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 作成状態に戻して曜日入力を空にする。
  const resetForm = () => {
    setTemplateId(null);
    setName("");
    setNote("");
    setDays(createOpeningDays(lessonPeriods));
    setError(null);
  };

  // テンプレート詳細を編集状態へ反映する。
  const loadTemplate = async (id: string, duplicate = false) => {
    setIsSaving(true);
    setError(null);
    try {
      const { branchOpeningScheduleTemplateById } =
        await getSdk(getGraphQLClient()).branchOpeningScheduleTemplateById({ templateId: id });
      if (!branchOpeningScheduleTemplateById) return;
      setTemplateId(duplicate ? null : id);
      setName(
        duplicate
          ? `${branchOpeningScheduleTemplateById.name ?? ""} コピー`
          : (branchOpeningScheduleTemplateById.name ?? ""),
      );
      setNote(branchOpeningScheduleTemplateById.note ?? "");
      setDays(createOpeningDays(lessonPeriods, branchOpeningScheduleTemplateById.days));
    } catch {
      setError("テンプレート詳細を取得できませんでした。");
    } finally {
      setIsSaving(false);
    }
  };

  // テンプレート親子をまとめて保存する。
  const saveTemplate = async () => {
    if (!name.trim()) {
      setError("テンプレート名を入力してください。");
      return;
    }
    setIsSaving(true);
    setError(null);
    const input = { name: name.trim(), note: note.trim() || null, days: toOpeningDayInputs(days) };
    try {
      const sdk = getSdk(getGraphQLClient());
      if (templateId) {
        await sdk.updateBranchOpeningScheduleTemplate({ templateId, input });
      } else {
        await sdk.createBranchOpeningScheduleTemplate({ input });
      }
      resetForm();
      revalidator.revalidate();
    } catch {
      setError("テンプレートを保存できませんでした。名前を確認してください。");
    } finally {
      setIsSaving(false);
    }
  };

  // テンプレートを論理削除する。
  const deleteTemplate = async (id: string) => {
    setIsSaving(true);
    setError(null);
    try {
      await getSdk(getGraphQLClient()).deleteBranchOpeningScheduleTemplate({ templateId: id });
      if (templateId === id) resetForm();
      revalidator.revalidate();
    } catch {
      setError("テンプレートを削除できませんでした。");
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
            <Breadcrumbs.Item className="text-foreground">開校テンプレート</Breadcrumbs.Item>
          </Breadcrumbs>
          <h1 className="text-xl font-semibold">開校スケジュールテンプレート</h1>
        </div>
        <Button variant="outline" onPress={resetForm}>
          <Plus className="size-4" />
          新規
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Table className="bg-surface">
          <Table.ScrollContainer>
            <Table.Content aria-label="opening schedule templates table">
              <Table.Header>
                <Table.Column id="name" isRowHeader>テンプレート名</Table.Column>
                <Table.Column id="actions">操作</Table.Column>
              </Table.Header>
              <Table.Body>
                {templates.length === 0 ? (
                  <Table.Row id="empty">
                    <Table.Cell colSpan={2}>データはありません</Table.Cell>
                  </Table.Row>
                ) : (
                  templates.flatMap((template) =>
                    template.id
                      ? [
                          <Table.Row id={template.id} key={template.id}>
                            <Table.Cell>{template.name}</Table.Cell>
                            <Table.Cell>
                              <div className="flex justify-end gap-1">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  onPress={() => void loadTemplate(String(template.id))}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  onPress={() => void loadTemplate(String(template.id), true)}
                                >
                                  <CopyPlus className="size-4" />
                                </Button>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  onPress={() => void deleteTemplate(String(template.id))}
                                >
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

        <div className="space-y-4">
          <div className="grid gap-3 border-y border-separator/70 py-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label isRequired>テンプレート名</Label>
              <Input value={name} onChange={(event) => setName(event.currentTarget.value)} />
            </div>
            <div className="space-y-1">
              <Label>備考</Label>
              <Input value={note} onChange={(event) => setNote(event.currentTarget.value)} />
            </div>
            <div className="md:col-span-2">
              {error ? <p className="text-danger text-sm">{error}</p> : null}
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button
                className="app-primary-button"
                isPending={isSaving}
                onPress={() => void saveTemplate()}
              >
                保存
              </Button>
              {templateId ? <Button variant="outline" onPress={resetForm}>編集解除</Button> : null}
            </div>
          </div>
          <OpeningScheduleEditor days={days} lessonPeriods={lessonPeriods} onChange={setDays} />
        </div>
      </div>
    </section>
  );
}
