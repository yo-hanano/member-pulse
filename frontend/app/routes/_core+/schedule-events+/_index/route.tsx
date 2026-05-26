import { Breadcrumbs, Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { type LoaderFunctionArgs, useLoaderData, useNavigation, useRevalidator } from "react-router";

import { type LeadOptionFragment, getSdk } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import { getGraphQLClient } from "~/services/graphql-client";
import { ScheduleEventCreateModal } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-create-modal";
import { ScheduleEventDeleteDialog } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-delete-dialog";
import { ScheduleEventEditModal } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-edit-modal";
import { ScheduleEventFiltersPanel } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-filters-panel";
import { ScheduleEventListTable } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-list-table";
import { useScheduleEventDelete } from "~/routes/_core+/schedule-events+/_index/hooks/useScheduleEventDelete";
import type { ScheduleEventRow } from "~/routes/_core+/schedule-events+/_index/schedule-event-row";

// 訪問・来塾予定一覧に必要なページデータだけを取得するローダー。
export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId") || undefined;
  const activityType = url.searchParams.get("activityType") || undefined;
  const note = url.searchParams.get("note") || undefined;
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const orderBy = url.searchParams.get("orderBy") || undefined;
  const orderDirection = url.searchParams.get("orderDirection") || undefined;

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const [{ scheduleEventPagination }, { allLeads }] = await Promise.all([
    sdk.scheduleEventPage({
      pagination: {
        offset: (page - 1) * limit,
        limit,
        orderBy,
        orderDirection,
      },
      filter: { scheduleSubjectId: leadId, scheduleType: activityType, note },
    }),
    sdk.allLeads(),
  ]);

  return {
    scheduleEventPage: scheduleEventPagination,
    leads: (allLeads ?? []).filter((lead): lead is LeadOptionFragment => Boolean(lead)),
  };
};

export function meta() {
  return [{ title: "訪問・来塾予定一覧" }, { name: "description", content: "訪問・来塾予定管理" }];
}

// 訪問・来塾予定一覧画面本体。create/edit は modal 側へ寄せる。
export default function ScheduleEventsIndexRoute() {
  const { scheduleEventPage, leads } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const { contents: scheduleEvents, totalPages, totalCount } = usePageData<ScheduleEventRow>(scheduleEventPage);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editScheduleEventId, setEditScheduleEventId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteScheduleEventId, setDeleteScheduleEventId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const deleteMutation = useScheduleEventDelete(() => {
    setIsDeleteOpen(false);
    setDeleteScheduleEventId(null);
    revalidator.revalidate();
  });

  const isProcessing =
    navigation.state !== "idle" ||
    revalidator.state !== "idle" ||
    deleteMutation.submitting;

  // 編集モーダルを開く。
  const openEdit = (scheduleEventIdValue: string) => {
    setEditScheduleEventId(scheduleEventIdValue);
    setIsEditOpen(true);
  };

  // 削除確認モーダルを開く。
  const openDelete = (scheduleEventIdValue: string) => {
    setDeleteScheduleEventId(scheduleEventIdValue);
    setIsDeleteOpen(true);
  };

  // 削除リクエスト送信。
  const submitDelete = () => {
    if (!deleteScheduleEventId) return;
    deleteMutation.submit(undefined, [{ scheduleEventId: deleteScheduleEventId }]);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Breadcrumbs className="mb-3 text-sm text-muted-foreground">
            <Breadcrumbs.Item href="/">ホーム</Breadcrumbs.Item>
            <Breadcrumbs.Item href="/leads">リード</Breadcrumbs.Item>
            <Breadcrumbs.Item className="text-foreground">訪問・来塾予定</Breadcrumbs.Item>
          </Breadcrumbs>
          <h1 className="text-xl font-semibold tracking-tight">訪問・来塾予定一覧</h1>
          <p className="text-muted-foreground mt-1 text-xs">訪問や来塾の予定を管理します。</p>
        </div>
        <Button className="app-primary-button" onPress={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          新規追加
        </Button>
      </div>

      <ScheduleEventFiltersPanel leads={leads} />

      <ScheduleEventListTable
        data={scheduleEvents}
        isProcessing={isProcessing}
        totalCount={totalCount}
        totalPages={totalPages}
        onDelete={openDelete}
        onEdit={openEdit}
      />

      <ScheduleEventCreateModal isOpen={isCreateOpen} leads={leads} onOpenChange={setIsCreateOpen} />

      <ScheduleEventEditModal
        scheduleEventId={editScheduleEventId}
        isOpen={isEditOpen}
        leads={leads}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditScheduleEventId(null);
        }}
      />

      <ScheduleEventDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteScheduleEventId(null);
        }}
        isPending={deleteMutation.submitting}
        onConfirm={submitDelete}
      />
    </section>
  );
}
