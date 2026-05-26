import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare } from "lucide-react";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRevalidator } from "react-router";

import { LeadFormFields } from "~/routes/_core+/leads+/_index/components/lead-form-fields";
import { emptyLeadForm, leadFormSchema, type LeadForm } from "~/routes/_core+/leads+/_index/lead-form-schema";
import { useLeadCreate } from "~/routes/_core+/leads+/_index/hooks/useLeadCreate";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// リード作成モーダル。フォーム、保存処理、再読込を内包する。
export function LeadCreateModal({ isOpen, onOpenChange }: Props) {
  const form = useForm<LeadForm>({
    resolver: zodResolver(leadFormSchema),
    mode: "onSubmit",
    defaultValues: emptyLeadForm,
  });

  // オープン時は初期値を反映する。
  useEffect(() => {
    if (isOpen) form.reset(emptyLeadForm);
  }, [form, isOpen]);

  const revalidator = useRevalidator();
  const createMutation = useLeadCreate(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<LeadForm> = (data) => {
    createMutation.submit(data);
  };

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
                <MessageSquare className="size-5 text-gray-700" />
              </span>
              <span>リードを作成</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">
              必要な情報を入力して作成します。完了したら保存をクリックしてください。
            </p>
            <LeadFormFields form={form} />
          </Modal.Body>
          <Modal.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button
              className="app-primary-button"
              isPending={createMutation.submitting}
              onPress={() => {
                void form.handleSubmit(onValid)();
              }}
            >
              保存
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
