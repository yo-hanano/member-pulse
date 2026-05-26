import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useFetcher, useRevalidator } from "react-router";

import type { clientLoader as employeeEditLoader } from "~/routes/_core+/employees+/$employeeId.edit/route";
import { EmployeeFormFields } from "~/routes/_core+/employees+/_index/components/employee-form-fields";
import type { EmployeeForm } from "~/routes/_core+/employees+/_index/employee-form-schema";
import { employeeFormSchema, emptyEmployeeForm } from "~/routes/_core+/employees+/_index/employee-form-schema";
import { useEmployeeEdit } from "~/routes/_core+/employees+/_index/hooks/useEmployeeEdit";

interface Props {
  employeeId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 従業員編集モーダル（詳細取得、フォーム、送信処理を内包する）。
export function EmployeeEditModal({ employeeId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof employeeEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);
  const isLoading = fetcher.state !== "idle";

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(employeeFormSchema),
    mode: "onSubmit",
    defaultValues: emptyEmployeeForm,
  });

  useEffect(() => {
    if (!isOpen || !employeeId) {
      lastLoadedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === employeeId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = employeeId;
    fetcher.load(`/employees/${employeeId}/edit`);
  }, [employeeId, fetcher, fetcher.state, isOpen]);

  useEffect(() => {
    const employee = fetcher.data?.employee;
    if (isOpen && employee) {
      form.reset({
        name: employee.name ?? "",
        email: employee.email ?? "",
        genderCode: employee.genderCode ?? "not_specified",
        isAdmin: employee.isAdmin ?? false,
      });
    }
  }, [fetcher.data, form, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useEmployeeEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });
  const isPending = editMutation.submitting || isLoading;

  const onValid: SubmitHandler<EmployeeForm> = (data) => {
    if (!employeeId) return;
    editMutation.submit(data, [{ employeeId }]);
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
                <PencilLine className="size-5 text-gray-700" />
              </span>
              <span>従業員を編集</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">
              必要な情報を入力して編集します。完了したら更新をクリックしてください。
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
