import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useFetcher, useRevalidator } from "react-router";

import type { clientLoader as leadEditLoader } from "~/routes/_core+/leads+/$leadId.edit/route";
import { LeadFormFields } from "~/routes/_core+/leads+/_index/components/lead-form-fields";
import { emptyLeadForm, leadFormSchema, type LeadForm } from "~/routes/_core+/leads+/_index/lead-form-schema";
import { useLeadEdit } from "~/routes/_core+/leads+/_index/hooks/useLeadEdit";
import { toDateTimeLocalValue } from "~/lib/date";

interface Props {
  leadId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// リード編集モーダル。詳細取得、フォーム、送信処理を内包する。
export function LeadEditModal({ leadId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof leadEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);
  const isLoading = fetcher.state !== "idle";

  const form = useForm<LeadForm>({
    resolver: zodResolver(leadFormSchema),
    mode: "onSubmit",
    defaultValues: emptyLeadForm,
  });

  // オープン時に対象リードを取得する。
  useEffect(() => {
    if (!isOpen || !leadId) {
      lastLoadedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === leadId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = leadId;
    fetcher.load(`/leads/${leadId}/edit`);
  }, [leadId, fetcher, fetcher.state, isOpen]);

  // 取得結果をフォームへ反映する。
  useEffect(() => {
    const lead = fetcher.data?.lead;
    if (!isOpen || !lead) return;
    form.reset({
      inquiryAt: toDateTimeLocalValue(lead.inquiryAt ?? ""),
      branchId: lead.branchId ?? "",
      studentName: lead.studentName ?? "",
      studentKana: lead.studentKana ?? "",
      guardianName: lead.guardianName ?? "",
      guardianKana: lead.guardianKana ?? "",
      schoolName: lead.schoolName ?? "",
      gradeName: lead.gradeName ?? "",
      phone: lead.phone ?? "",
      email: lead.email ?? "",
      channel: lead.channel ?? "",
      status: (lead.status ?? "new") as LeadForm["status"],
      note: lead.note ?? "",
    });
  }, [fetcher.data, form, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useLeadEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<LeadForm> = (data) => {
    if (!leadId) return;
    editMutation.submit(data, [{ leadId }]);
  };

  const isPending = editMutation.submitting || isLoading;

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(emptyLeadForm);
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
              <span>リードを編集</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">
              必要な情報を入力して編集します。完了したら更新をクリックしてください。
            </p>
            <LeadFormFields form={form} />
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
