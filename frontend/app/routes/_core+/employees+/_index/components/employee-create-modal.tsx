import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus2 } from "lucide-react";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRevalidator } from "react-router";

import { EmployeeFormFields } from "~/routes/_core+/employees+/_index/components/employee-form-fields";
import type { EmployeeForm } from "~/routes/_core+/employees+/_index/employee-form-schema";
import { employeeFormSchema, emptyEmployeeForm } from "~/routes/_core+/employees+/_index/employee-form-schema";
import { useEmployeeCreate } from "~/routes/_core+/employees+/_index/hooks/useEmployeeCreate";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 従業員作成モーダル（フォームと送信処理を内包する）。
export function EmployeeCreateModal({ isOpen, onOpenChange }: Props) {
  const form = useForm<EmployeeForm>({
    resolver: zodResolver(employeeFormSchema),
    mode: "onSubmit",
    defaultValues: emptyEmployeeForm,
  });

  useEffect(() => {
    if (isOpen) form.reset(emptyEmployeeForm);
  }, [form, isOpen]);

  const revalidator = useRevalidator();
  const createMutation = useEmployeeCreate(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });
  const isPending = createMutation.submitting;

  const onValid: SubmitHandler<EmployeeForm> = (data) => {
    createMutation.submit(data);
  };

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(emptyEmployeeForm);
      }}
    >
      <Modal.Container className="max-w-6xl" size="cover">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <UserPlus2 className="size-5 text-gray-700" />
              </span>
              <span>従業員を作成</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">
              必要な情報を入力して作成します。完了したら保存をクリックしてください。
            </p>
            <EmployeeFormFields form={form} />
          </Modal.Body>
          <Modal.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button className="app-primary-button" isPending={isPending} onPress={() => { void form.handleSubmit(onValid)(); }}>
              保存
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
