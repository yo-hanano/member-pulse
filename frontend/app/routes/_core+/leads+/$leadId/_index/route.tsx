import { Button, Card, Chip, Label, Modal, TextArea } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, PencilLine, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext, useRevalidator } from "react-router";
import { z } from "zod";

import type { clientAction as updateLeadStatusNoteAction, LeadDetailContext } from "~/routes/_core+/leads+/$leadId/route";
import { FieldErrorText } from "~/components/form/field-error-text";
import { SelectField } from "~/components/form/select-field";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { formatDateTimeYmdHm } from "~/lib/date";
import { formatLeadStatus, leadStatusColor, leadStatusOptions, leadStatusValues } from "~/routes/_core+/leads+/_index/lead-status";
import {
  formatScheduleEventStatus,
  formatScheduleEventType,
  scheduleEventStatusColor,
} from "~/routes/_core+/schedule-events+/_index/schedule-event-options";

const statusNoteSchema = z.object({
  status: z.enum(leadStatusValues),
  note: z.string().max(1000).optional().or(z.literal("")),
});

type StatusNoteForm = z.infer<typeof statusNoteSchema>;
type UpdateLeadStatusNoteActionData = Awaited<ReturnType<typeof updateLeadStatusNoteAction>>;

// リード詳細の概要タブ。
export default function LeadDetailOverviewRoute() {
  const { lead, latestScheduleEvent } = useOutletContext<LeadDetailContext>();
  const navigate = useNavigate();
  const [isStatusNoteOpen, setStatusNoteOpen] = useState(false);
  const canStartEnrollment = lead.status === "contracted";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button className="border-border text-foreground hover:bg-default-100" variant="outline" onPress={() => navigate("/leads")}>
          <ArrowLeft className="size-4" />
          一覧へ戻る
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {canStartEnrollment ? (
            <Button className="app-primary-button" onPress={() => navigate(`/leads/${lead.id}/enrollment`)}>
              <UserPlus className="size-4" />
              入会処理へ
            </Button>
          ) : null}
          <Button className="border-border text-foreground hover:bg-default-100" variant="outline" onPress={() => setStatusNoteOpen(true)}>
            <PencilLine className="size-4" />
            状態・メモを更新
          </Button>
        </div>
      </div>

      <Card className="border-border/60 bg-surface">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">問合せ日</p>
            <p className="text-sm font-medium">{formatDateTimeYmdHm(lead.inquiryAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">拠点</p>
            <p className="text-sm font-medium">{lead.branch?.name ?? lead.branch?.code ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">生徒名</p>
            <p className="text-sm font-medium">{lead.studentName ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">生徒名かな</p>
            <p className="text-sm font-medium">{lead.studentKana ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">保護者名</p>
            <p className="text-sm font-medium">{lead.guardianName ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">保護者名かな</p>
            <p className="text-sm font-medium">{lead.guardianKana ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">学校名</p>
            <p className="text-sm font-medium">{lead.schoolName ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">学年名</p>
            <p className="text-sm font-medium">{lead.gradeName ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">電話番号</p>
            <p className="text-sm font-medium">{lead.phone ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">メールアドレス</p>
            <p className="text-sm font-medium">{lead.email ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">流入経路</p>
            <p className="text-sm font-medium">{lead.channel ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">状態</p>
            <Chip color={leadStatusColor(lead.status)} size="sm" variant="soft">
              {formatLeadStatus(lead.status)}
            </Chip>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">訪問来塾</p>
            {latestScheduleEvent ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{formatScheduleEventType(latestScheduleEvent.activityType)}</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">{formatDateTimeYmdHm(latestScheduleEvent.activityAt)}</span>
                <Chip color={scheduleEventStatusColor(latestScheduleEvent.status)} size="sm" variant="soft">
                  {formatScheduleEventStatus(latestScheduleEvent.status)}
                </Chip>
              </div>
            ) : (
              <p className="text-sm font-medium">-</p>
            )}
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-muted-foreground text-xs">メモ</p>
            <p className="text-sm whitespace-pre-wrap">{lead.note ?? "-"}</p>
          </div>
        </div>
      </Card>

      <LeadStatusNoteModal isOpen={isStatusNoteOpen} lead={lead} onOpenChange={setStatusNoteOpen} />
    </div>
  );
}

interface LeadStatusNoteModalProps {
  isOpen: boolean;
  lead: LeadDetailContext["lead"];
  onOpenChange: (open: boolean) => void;
}

// リードの営業判断に関わる状態とメモだけを更新するモーダル。
function LeadStatusNoteModal({ isOpen, lead, onOpenChange }: LeadStatusNoteModalProps) {
  const form = useForm<StatusNoteForm>({
    resolver: zodResolver(statusNoteSchema),
    mode: "onSubmit",
    defaultValues: {
      status: (lead.status ?? "new") as StatusNoteForm["status"],
      note: lead.note ?? "",
    },
  });
  const revalidator = useRevalidator();
  const mutation = useActionFetcher<UpdateLeadStatusNoteActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      revalidator.revalidate();
      onOpenChange(false);
    },
  });

  // モーダルを開くたびに、現在表示中の lead の値へ戻す。
  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      status: (lead.status ?? "new") as StatusNoteForm["status"],
      note: lead.note ?? "",
    });
  }, [form, isOpen, lead.note, lead.status]);

  const onValid: SubmitHandler<StatusNoteForm> = (data) => {
    if (!lead.id) return;
    mutation.submit(data, [{ leadId: lead.id }]);
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container className="max-w-2xl">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <PencilLine className="size-5 text-gray-700" />
              </span>
              <span>状態・メモを更新</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="grid grid-cols-1 gap-4">
              <SelectField
                ariaLabel="状態"
                isRequired
                items={leadStatusOptions.map((option) => ({ id: option.value, textValue: option.label, content: option.label }))}
                label="状態"
                onChange={(value) => form.setValue("status", value as StatusNoteForm["status"], { shouldDirty: true, shouldValidate: true })}
                value={form.watch("status") ?? null}
              />
              <FieldErrorText message={form.formState.errors.status?.message} />

              <div className="space-y-1">
                <Label className="block">メモ</Label>
                <TextArea
                  aria-label="メモ"
                  className="border-border w-full rounded-lg border bg-default-50 shadow-sm"
                  rows={6}
                  {...form.register("note")}
                />
                <FieldErrorText message={form.formState.errors.note?.message} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button className="app-primary-button" isPending={mutation.submitting} onPress={() => void form.handleSubmit(onValid)()}>
              更新
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
