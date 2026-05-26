import { Breadcrumbs, Button, Input, Label, Table } from "@heroui/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 時限マスタ一覧を取得する。
export const clientLoader = async () => {
  const sdk = getSdk(getGraphQLClient());
  const { allLessonPeriods } = await sdk.allLessonPeriods();
  return { lessonPeriods: (allLessonPeriods ?? []).flatMap((period) => (period?.id ? [period] : [])) };
};

// 会社内で使う時限軸を編集する画面。
export default function LessonPeriodsIndexRoute() {
  const { lessonPeriods } = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();
  const stablePeriods = useMemo(() => lessonPeriods.filter((period) => period.id), [lessonPeriods]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [dispOrder, setDispOrder] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 作成フォームを初期化する。
  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDispOrder(String((stablePeriods.at(-1)?.dispOrder ?? stablePeriods.length) + 1));
    setError(null);
  };

  // 選択行を編集フォームへ反映する。
  const startEdit = (period: (typeof stablePeriods)[number]) => {
    setEditingId(String(period.id));
    setName(period.name ?? "");
    setDispOrder(String(period.dispOrder ?? ""));
    setError(null);
  };

  // 入力値を時限 mutation へ送る。
  const savePeriod = async () => {
    const order = Number(dispOrder);
    if (!name.trim() || !Number.isInteger(order) || order <= 0) {
      setError("表示名と 1 以上の表示順を入力してください。");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const sdk = getSdk(getGraphQLClient());
      if (editingId) {
        await sdk.updateLessonPeriod({
          lessonPeriodId: editingId,
          input: { name: name.trim(), dispOrder: order },
        });
      } else {
        await sdk.createLessonPeriod({ input: { name: name.trim(), dispOrder: order } });
      }
      resetForm();
      revalidator.revalidate();
    } catch {
      setError("時限を保存できませんでした。表示順の重複も確認してください。");
    } finally {
      setIsSaving(false);
    }
  };

  // 参照済み時限も DB 上は残したまま論理削除する。
  const deletePeriod = async (lessonPeriodId: string) => {
    setIsSaving(true);
    setError(null);
    try {
      await getSdk(getGraphQLClient()).deleteLessonPeriod({ lessonPeriodId });
      if (editingId === lessonPeriodId) resetForm();
      revalidator.revalidate();
    } catch {
      setError("時限を削除できませんでした。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <Breadcrumbs className="mb-3 text-sm text-muted-foreground">
          <Breadcrumbs.Item href="/">ホーム</Breadcrumbs.Item>
          <Breadcrumbs.Item className="text-foreground">時限マスタ</Breadcrumbs.Item>
        </Breadcrumbs>
        <h1 className="text-xl font-semibold">時限マスタ</h1>
      </div>

      <div className="grid gap-4 border-y border-separator/70 py-4 md:grid-cols-[minmax(0,360px)_1fr]">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label isRequired>表示名</Label>
            <Input value={name} onChange={(event) => setName(event.currentTarget.value)} />
          </div>
          <div className="space-y-1">
            <Label isRequired>表示順</Label>
            <Input
              min={1}
              type="number"
              value={dispOrder}
              onChange={(event) => setDispOrder(event.currentTarget.value)}
            />
          </div>
          {error ? <p className="text-danger text-sm">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button className="app-primary-button" isPending={isSaving} onPress={() => void savePeriod()}>
              <Plus className="size-4" />
              {editingId ? "更新" : "追加"}
            </Button>
            {editingId ? (
              <Button variant="outline" onPress={resetForm}>
                編集解除
              </Button>
            ) : null}
          </div>
        </div>

        <Table className="bg-surface">
          <Table.ScrollContainer>
            <Table.Content aria-label="lesson periods table">
              <Table.Header>
                <Table.Column id="name" isRowHeader>表示名</Table.Column>
                <Table.Column id="order">表示順</Table.Column>
                <Table.Column id="actions">操作</Table.Column>
              </Table.Header>
              <Table.Body>
                {stablePeriods.length === 0 ? (
                  <Table.Row id="empty">
                    <Table.Cell colSpan={3}>データはありません</Table.Cell>
                  </Table.Row>
                ) : (
                  stablePeriods.map((period) => (
                    <Table.Row id={String(period.id)} key={period.id}>
                      <Table.Cell>{period.name}</Table.Cell>
                      <Table.Cell>{period.dispOrder}</Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-1">
                          <Button isIconOnly size="sm" variant="ghost" onPress={() => startEdit(period)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            onPress={() => void deletePeriod(String(period.id))}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </section>
  );
}
