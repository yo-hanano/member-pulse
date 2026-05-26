import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap } from "lucide-react";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRevalidator } from "react-router";

import { StudentFormFields } from "~/routes/_core+/students+/_index/components/student-form-fields";
import { useStudentCreate } from "~/routes/_core+/students+/_index/hooks/useStudentCreate";
import {
  emptyStudentBaseForm,
  type StudentBaseForm,
  studentBaseFormSchema,
} from "~/routes/_core+/students+/_index/student-form-schema";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 生徒作成モーダル。フォーム、保存処理、再読込を内包する。
export function StudentCreateModal({ isOpen, onOpenChange }: Props) {
  const form = useForm<StudentBaseForm>({
    resolver: zodResolver(studentBaseFormSchema),
    mode: "onSubmit",
    defaultValues: emptyStudentBaseForm,
  });

  // オープン時は初期値を反映する。
  useEffect(() => {
    if (isOpen) form.reset(emptyStudentBaseForm);
  }, [form, isOpen]);

  const revalidator = useRevalidator();
  const createMutation = useStudentCreate(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<StudentBaseForm> = (data) => {
    createMutation.submit(data);
  };

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(emptyStudentBaseForm);
      }}
    >
      <Modal.Container className="max-w-5xl" size="cover">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <GraduationCap className="size-5 text-gray-700" />
              </span>
              <span>生徒を作成</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">
              必要な情報を入力して作成します。完了したら保存をクリックしてください。
            </p>
            <StudentFormFields form={form} />
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="border-border text-foreground hover:bg-default-100"
              slot="close"
              variant="outline"
            >
              キャンセル
            </Button>
            <Button
              className="app-primary-button"
              isPending={createMutation.state !== "idle"}
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
