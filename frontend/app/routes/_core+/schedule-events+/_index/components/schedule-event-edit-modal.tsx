import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useFetcher, useRevalidator } from "react-router";

import type { LeadOptionFragment } from "~/generated/graphql";
import { toDateTimeLocalValue } from "~/lib/date";
import type { clientLoader as scheduleEventEditLoader } from "~/routes/_core+/schedule-events+/$scheduleEventId.edit/route";
import { ScheduleEventFormFields } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-form-fields";
import {
  buildEmptyScheduleEventForm,
  scheduleEventFormSchema,
  type ScheduleEventForm,
} from "~/routes/_core+/schedule-events+/_index/schedule-event-form-schema";
import { useScheduleEventEdit } from "~/routes/_core+/schedule-events+/_index/hooks/useScheduleEventEdit";

interface Props {
  scheduleEventId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leads: LeadOptionFragment[];
  fixedLead?: LeadOptionFragment | null;
}

// 訪問・来塾予定編集モーダル。詳細取得、フォーム、送信処理を内包する。
export function ScheduleEventEditModal({ scheduleEventId, isOpen, onOpenChange, leads, fixedLead }: Props) {
  const fetcher = useFetcher<typeof scheduleEventEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);
  const isLoading = fetcher.state !== "idle";

  const form = useForm<ScheduleEventForm>({
    resolver: zodResolver(scheduleEventFormSchema),
    mode: "onSubmit",
    defaultValues: buildEmptyScheduleEventForm(),
  });

  // オープン時に対象予定を取得する。
  useEffect(() => {
    if (!isOpen || !scheduleEventId) {
      lastLoadedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === scheduleEventId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = scheduleEventId;
    fetcher.load(`/schedule-events/${scheduleEventId}/edit`);
  }, [scheduleEventId, fetcher, fetcher.state, isOpen]);

  // 取得結果をフォームへ反映する。
  useEffect(() => {
    const scheduleEvent = fetcher.data?.scheduleEvent;
    if (!isOpen || !scheduleEvent) return;
    form.reset({
      leadId: fixedLead?.id ?? scheduleEvent.leadId ?? "",
      activityType: (scheduleEvent.activityType ?? "trial_lesson") as ScheduleEventForm["activityType"],
      activityAt: toDateTimeLocalValue(scheduleEvent.activityAt),
      status: scheduleEvent.status ?? "planned",
      reason: scheduleEvent.reason ?? "",
      note: scheduleEvent.note ?? "",
    });
  }, [fetcher.data, fixedLead?.id, form, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useScheduleEventEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<ScheduleEventForm> = (data) => {
    if (!scheduleEventId) return;
    editMutation.submit(data, [{ scheduleEventId }]);
  };

  const isPending = editMutation.submitting || isLoading;

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(buildEmptyScheduleEventForm());
      }}
    >
      <Modal.Container className="max-w-6xl" size="cover">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <PencilLine className="size-5 text-gray-700" />
              </span>
              <span>訪問・来塾予定を編集</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">
              必要な情報を入力して編集します。完了したら更新をクリックしてください。
            </p>
            <ScheduleEventFormFields fixedLead={fixedLead} form={form} leads={leads} />
          </Modal.Body>
          <Modal.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button
              className="app-primary-button"
              isPending={isPending}
              onPress={() => {
                void form.handleSubmit(onValid)();
              }}
            >
              更新
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
