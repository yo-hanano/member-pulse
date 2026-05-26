import { Button, Modal } from "@heroui/react";
import { CalendarPlus } from "lucide-react";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRevalidator } from "react-router";

import type { LeadOptionFragment } from "~/generated/graphql";
import { useScheduleEventCreate } from "~/routes/_core+/schedule-events+/_index/hooks/useScheduleEventCreate";
import { buildEmptyScheduleEventForm, type ScheduleEventForm, scheduleEventFormSchema } from "~/routes/_core+/schedule-events+/_index/schedule-event-form-schema";
import { ScheduleEventFormFields } from "~/routes/_core+/schedule-events+/_index/components/schedule-event-form-fields";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leads: LeadOptionFragment[];
  fixedLead?: LeadOptionFragment | null;
  mode?: "create" | "append";
}

export function ScheduleEventCreateModal({ isOpen, onOpenChange, leads, fixedLead, mode = "create" }: Props) {
  const form = useForm<ScheduleEventForm>({
    resolver: zodResolver(scheduleEventFormSchema),
    mode: "onSubmit",
    defaultValues: buildEmptyScheduleEventForm(),
  });

  // オープン時は現在時刻を含む初期値を再生成する。
  useEffect(() => {
    if (isOpen) {
      form.reset({
        ...buildEmptyScheduleEventForm(),
        leadId: fixedLead?.id ?? "",
      });
    }
  }, [fixedLead?.id, form, isOpen]);

  const revalidator = useRevalidator();
  const createMutation = useScheduleEventCreate(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<ScheduleEventForm> = (data) => {
    createMutation.submit(data);
  };

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
                <CalendarPlus className="size-5 text-gray-700" />
              </span>
              <span>{mode === "append" ? "次の予定を追加" : "訪問・来塾予定を作成"}</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">
              {mode === "append"
                ? "最終行の続きとして、次の予定を登録します。"
                : "必要な情報を入力して作成します。完了したら保存をクリックしてください。"}
            </p>
            <ScheduleEventFormFields fixedLead={fixedLead} form={form} leads={leads} />
          </Modal.Body>
          <Modal.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button
              className="app-primary-button"
              isPending={createMutation.submitting}
              variant="primary"
              onPress={() => {
                void form.handleSubmit(onValid)();
              }}
            >
              {mode === "append" ? "次の予定を追加" : "作成"}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
