import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useFetcher, useRevalidator } from "react-router";
import { StudentFormFields } from "~/routes/_core+/students+/_index/components/student-form-fields";
import { useStudentEdit } from "~/routes/_core+/students+/_index/hooks/useStudentEdit";
import {
  emptyStudentBaseForm,
  type StudentBaseForm,
  studentBaseFormSchema,
} from "~/routes/_core+/students+/_index/student-form-schema";
import type { clientLoader as studentEditLoader } from "~/routes/_core+/students+/$studentId.edit/route";

interface Props {
  studentId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 生徒編集モーダル。詳細取得、フォーム、更新処理を内包する。
export function StudentEditModal({ studentId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof studentEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);

  const form = useForm<StudentBaseForm>({
    resolver: zodResolver(studentBaseFormSchema),
    mode: "onSubmit",
    defaultValues: emptyStudentBaseForm,
  });

  // オープン時に対象生徒を取得する。
  useEffect(() => {
    if (!isOpen || !studentId) {
      lastLoadedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === studentId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = studentId;
    fetcher.load(`/students/${studentId}/edit`);
  }, [studentId, fetcher, fetcher.state, isOpen]);

  // 取得結果をフォームへ反映する。
  useEffect(() => {
    const student = fetcher.data?.student;
    if (!isOpen || !student) return;
    form.reset({
      code: student.code ?? "",
      name: student.name ?? "",
      kana: student.kana ?? "",
      birthday: student.birthday ?? "",
      genderCode: student.genderCode ?? "not_specified",
      branchId: student.branchId ?? "",
      schoolCode: student.schoolCode ?? "",
      schoolGradeCode: student.schoolGradeCode ?? "",
      status: (student.status ?? "active") as StudentBaseForm["status"],
      note: student.note ?? "",
    });
  }, [fetcher.data, form, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useStudentEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<StudentBaseForm> = (data) => {
    if (!studentId) return;
    editMutation.submit(data, [{ studentId }]);
  };

  const isPending = editMutation.state !== "idle" || fetcher.state !== "idle";

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(emptyStudentBaseForm);
      }}
    >
      <Modal.Container className="max-w-6xl" size="cover">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <GraduationCap className="size-5 text-gray-700" />
              </span>
              <span>生徒を編集</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">
              必要な情報を入力して編集します。完了したら更新をクリックしてください。
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
