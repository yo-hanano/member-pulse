import { Button, Surface } from "@heroui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { type LoaderFunctionArgs, useLoaderData, useNavigation, useRevalidator, useOutletContext } from "react-router";

import { getSdk } from "~/generated/graphql";
import { usePageData } from "~/hooks/usePageData";
import type { LeadDetailContext } from "~/routes/_core+/leads+/$leadId/route";
import { ScheduleEventCreateModal } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-create-modal";
import { ScheduleEventDeleteDialog } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-delete-dialog";
import { ScheduleEventEditModal } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-edit-modal";
import {
  ScheduleEventOperationModal,
  type ScheduleEventOperationMode,
} from "~/routes/_core+/schedule-events+/_index/components/schedule-event-operation-modal";
import { ScheduleEventListTable } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-list-table";
import { useScheduleEventDelete } from "~/routes/_core+/schedule-events+/_index/hooks/useScheduleEventDelete";
import type { ScheduleEventRow } from "~/routes/_core+/schedule-events+/_index/schedule-event-row";
import { getGraphQLClient } from "~/services/graphql-client";

// リードに紐づく訪問・来塾予定一覧を取得する。
export const clientLoader = async ({ params, request }: LoaderFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const orderBy = url.searchParams.get("orderBy") || undefined;
  const orderDirection = url.searchParams.get("orderDirection") || undefined;

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { scheduleEventPagination } = await sdk.scheduleEventPage({
    pagination: {
      offset: (page - 1) * limit,
      limit,
      orderBy,
      orderDirection,
    },
    filter: { scheduleSubjectId: leadId },
  });

  return {
    scheduleEventPage: scheduleEventPagination,
  };
};

// リード詳細から予定を管理する。
export default function LeadDetailScheduleEventsRoute() {
  const { lead } = useOutletContext<LeadDetailContext>();
  const { scheduleEventPage } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const { contents: scheduleEvents, totalPages, totalCount } = usePageData<ScheduleEventRow>(scheduleEventPage);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editScheduleEventId, setEditScheduleEventId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteScheduleEventId, setDeleteScheduleEventId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [operationScheduleEventId, setOperationScheduleEventId] = useState<string | null>(null);
  const [operationMode, setOperationMode] = useState<ScheduleEventOperationMode | null>(null);
  const [isOperationOpen, setIsOperationOpen] = useState(false);

  const deleteMutation = useScheduleEventDelete(() => {
    setIsDeleteOpen(false);
    setDeleteScheduleEventId(null);
    revalidator.revalidate();
  });

  const isProcessing = navigation.state !== "idle" || revalidator.state !== "idle" || deleteMutation.submitting;

  const openCreate = () => {
    setIsCreateOpen(true);
  };

  const openEdit = (scheduleEventIdValue: string) => {
    setEditScheduleEventId(scheduleEventIdValue);
    setIsEditOpen(true);
  };

  const openOperation = (scheduleEventIdValue: string, mode: ScheduleEventOperationMode) => {
    setOperationScheduleEventId(scheduleEventIdValue);
    setOperationMode(mode);
    setIsOperationOpen(true);
  };

  const openDelete = (scheduleEventIdValue: string) => {
    setDeleteScheduleEventId(scheduleEventIdValue);
    setIsDeleteOpen(true);
  };

  const submitDelete = () => {
    if (!deleteScheduleEventId) return;
    deleteMutation.submit(undefined, [{ scheduleEventId: deleteScheduleEventId }]);
  };

  return (
    <div className="space-y-4">
      <Surface className="app-form-surface">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">訪問・来塾予定</h2>
            <p className="text-muted-foreground mt-1 text-xs">このリードに紐づく予定だけを表示します。最新行から次の予定を追加できます。</p>
          </div>
          <Button className="app-primary-button" onPress={openCreate}>
            <Plus className="size-4" />
            予定を追加
          </Button>
        </div>
      </Surface>

      <ScheduleEventListTable
        data={scheduleEvents}
        isProcessing={isProcessing}
        actionMode="append"
        showLeadColumn={false}
        totalCount={totalCount}
        totalPages={totalPages}
        onDelete={openDelete}
        onEdit={openEdit}
        onOperate={openOperation}
      />

      <ScheduleEventCreateModal fixedLead={lead} isOpen={isCreateOpen} leads={[lead]} onOpenChange={setIsCreateOpen} />

      <ScheduleEventEditModal
        fixedLead={lead}
        isOpen={isEditOpen}
        scheduleEventId={editScheduleEventId}
        leads={[lead]}
        onOpenChange={setIsEditOpen}
      />

      <ScheduleEventDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={submitDelete}
        isPending={deleteMutation.submitting}
      />

      <ScheduleEventOperationModal
        isOpen={isOperationOpen}
        mode={operationMode}
        scheduleEventId={operationScheduleEventId}
        onOpenChange={(open) => {
          setIsOperationOpen(open);
          if (!open) {
            setOperationScheduleEventId(null);
            setOperationMode(null);
          }
        }}
      />
    </div>
  );
}
