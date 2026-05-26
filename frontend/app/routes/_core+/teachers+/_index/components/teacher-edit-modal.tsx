import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useFetcher, useRevalidator } from "react-router";

import type { clientLoader as teacherEditLoader } from "~/routes/_core+/teachers+/$teacherId.edit/route";
import { TeacherFormFields } from "~/routes/_core+/teachers+/_index/components/teacher-form-fields";
import { emptyTeacherForm, teacherFormSchema, type TeacherForm } from "~/routes/_core+/teachers+/_index/teacher-form-schema";
import { useTeacherEdit } from "~/routes/_core+/teachers+/_index/hooks/useTeacherEdit";

interface Props {
  teacherId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 講師編集モーダル。詳細取得、フォーム、更新処理を内包する。
export function TeacherEditModal({ teacherId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof teacherEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);

  const form = useForm<TeacherForm>({
    resolver: zodResolver(teacherFormSchema),
    mode: "onSubmit",
    defaultValues: emptyTeacherForm,
  });

  // オープン時に対象講師を取得する。
  useEffect(() => {
    if (!isOpen || !teacherId) {
      lastLoadedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === teacherId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = teacherId;
    fetcher.load(`/teachers/${teacherId}/edit`);
  }, [teacherId, fetcher, fetcher.state, isOpen]);

  // 取得結果をフォームへ反映する。
  useEffect(() => {
    const teacher = fetcher.data?.teacher;
    if (!isOpen || !teacher) return;
    form.reset({
      code: teacher.code ?? "",
      name: teacher.name ?? "",
      kana: teacher.kana ?? "",
      birthday: teacher.birthday ?? "",
      genderCode: teacher.genderCode ?? "not_specified",
      schoolCode: teacher.schoolCode ?? "",
      schoolGradeCode: teacher.schoolGradeCode ?? "",
      phone: teacher.phone ?? "",
      email: teacher.email ?? "",
      status: (teacher.status ?? "active") as TeacherForm["status"],
      note: teacher.note ?? "",
    });
  }, [fetcher.data, form, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useTeacherEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<TeacherForm> = (data) => {
    if (!teacherId) return;
    editMutation.submit(data, [{ teacherId }]);
  };

  const isPending = editMutation.state !== "idle" || fetcher.state !== "idle";

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(emptyTeacherForm);
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
              <span>講師を編集</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">必要な情報を入力して編集します。完了したら更新をクリックしてください。</p>
            <TeacherFormFields form={form} />
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
