import { Button, Card, Chip, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { type ActionFunctionArgs, useOutletContext, useRevalidator } from "react-router";
import { z } from "zod";

import { GuardianFormFields } from "~/components/form/guardian-form-fields";
import { type GuardianInput, getSdk, type StudentFormInitialFragment } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import {
  type StudentForm,
  type StudentGuardianForm,
  studentGuardianFormSchema,
} from "~/routes/_core+/students+/_index/student-form-schema";
import type { StudentDetailContext } from "~/routes/_core+/students+/$studentId/route";
import { getGraphQLClient } from "~/services/graphql-client";

const guardianOperationSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("save"),
    guardian: studentGuardianFormSchema.shape.guardian,
  }),
  z.object({
    operation: z.literal("setPrimary"),
    guardianId: z.string().min(1),
  }),
  z.object({
    operation: z.literal("delete"),
    guardianId: z.string().min(1),
  }),
]);

type GuardianOperation = z.infer<typeof guardianOperationSchema>;
type StudentGuardian = NonNullable<NonNullable<StudentFormInitialFragment["guardians"]>[number]>;

// 保護者情報タブの操作を実行する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const studentId = params.studentId;
  if (!studentId) {
    throw new Response("studentId is required", { status: 400 });
  }

  const payload = guardianOperationSchema.parse(await request.json());
  const client = getGraphQLClient();
  const sdk = getSdk(client);

  if (payload.operation === "save") {
    const { saveStudentGuardian } = await sdk.saveStudentGuardian({
      studentId,
      input: toGuardianInput(payload.guardian),
    });
    return {
      message: saveStudentGuardian ? "ok" : "ng",
      guardian: saveStudentGuardian ?? undefined,
      notify: saveStudentGuardian
        ? { type: "success" as const, message: "保護者情報を保存しました" }
        : { type: "error" as const, message: "保存に失敗しました" },
    };
  }

  if (payload.operation === "setPrimary") {
    const { setPrimaryStudentGuardian } = await sdk.setPrimaryStudentGuardian({
      studentId,
      guardianId: payload.guardianId,
    });
    return {
      message: setPrimaryStudentGuardian ? "ok" : "ng",
      guardian: setPrimaryStudentGuardian ?? undefined,
      notify: setPrimaryStudentGuardian
        ? { type: "success" as const, message: "主連絡先を更新しました" }
        : { type: "error" as const, message: "更新に失敗しました" },
    };
  }

  const { deleteStudentGuardian } = await sdk.deleteStudentGuardian({
    studentId,
    guardianId: payload.guardianId,
  });
  return {
    message: deleteStudentGuardian ? "ok" : "ng",
    notify: deleteStudentGuardian
      ? { type: "success" as const, message: "保護者情報を削除しました" }
      : { type: "error" as const, message: "削除に失敗しました" },
  };
};

type StudentGuardianActionData = Awaited<ReturnType<typeof clientAction>>;

// 生徒詳細の保護者情報タブ。
export default function StudentGuardiansRoute() {
  const { student } = useOutletContext<StudentDetailContext>();
  const guardians = (student.guardians ?? []).filter((guardian): guardian is StudentGuardian =>
    Boolean(guardian?.id),
  );
  const [isGuardianOpen, setGuardianOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<StudentGuardian | null>(null);
  const revalidator = useRevalidator();
  const operation = useActionFetcher<StudentGuardianActionData>({
    defaultAction: ({ studentId }: { studentId: string }) => `/students/${studentId}/guardians`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      revalidator.revalidate();
    },
  });

  // 保護者の新規追加モーダルを開く。
  const openCreate = () => {
    setEditingGuardian(null);
    setGuardianOpen(true);
  };

  // 保護者の編集モーダルを開く。
  const openEdit = (guardian: StudentGuardian) => {
    setEditingGuardian(guardian);
    setGuardianOpen(true);
  };

  // 指定した保護者を主連絡先にする。
  const setPrimary = (guardianId: string) => {
    if (!student.id) return;
    operation.submit({ operation: "setPrimary", guardianId } satisfies GuardianOperation, [
      { studentId: student.id },
    ]);
  };

  // 生徒と保護者の紐付けを削除する。
  const deleteGuardian = (guardianId: string) => {
    if (!student.id) return;
    operation.submit({ operation: "delete", guardianId } satisfies GuardianOperation, [
      { studentId: student.id },
    ]);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-surface">
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">保護者情報</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                生徒に紐づく保護者と主連絡先を管理します。
              </p>
            </div>
            <Button className="app-primary-button" onPress={openCreate}>
              <Plus className="size-4" />
              追加
            </Button>
          </div>

          {guardians.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed border-border/70 p-8 text-center text-sm">
              保護者情報はまだ登録されていません
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {guardians.map((guardian) => (
                <GuardianCard
                  key={guardian.id}
                  guardian={guardian}
                  isProcessing={operation.submitting}
                  onDelete={deleteGuardian}
                  onEdit={openEdit}
                  onSetPrimary={setPrimary}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <GuardianEditModal
        student={student}
        guardian={editingGuardian}
        isOpen={isGuardianOpen}
        onOpenChange={(open) => {
          setGuardianOpen(open);
          if (!open) setEditingGuardian(null);
        }}
      />
    </div>
  );
}

// フォーム値を GraphQL の GuardianInput へ変換する。
function toGuardianInput(guardian: StudentGuardianForm["guardian"]): GuardianInput {
  return {
    id: guardian.id || undefined,
    name: guardian.name,
    kana: guardian.kana,
    relationshipCode: guardian.relationshipCode,
    prefectureCode: guardian.prefectureCode,
    phone: guardian.phone,
    email: guardian.email || undefined,
    postalCode: guardian.postalCode,
    address: guardian.address,
    note: guardian.note || undefined,
  };
}

interface GuardianCardProps {
  guardian: StudentGuardian;
  isProcessing?: boolean;
  onDelete: (guardianId: string) => void;
  onEdit: (guardian: StudentGuardian) => void;
  onSetPrimary: (guardianId: string) => void;
}

// 保護者1件分の情報と操作を表示する。
function GuardianCard({
  guardian,
  isProcessing,
  onDelete,
  onEdit,
  onSetPrimary,
}: GuardianCardProps) {
  const guardianId = String(guardian.id);

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-default-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{guardian.name ?? "-"}</h3>
            {guardian.primaryContact ? (
              <Chip size="sm" variant="soft">
                主連絡先
              </Chip>
            ) : null}
          </div>
          <p className="text-muted-foreground text-xs">{guardian.kana ?? "-"}</p>
        </div>
        <div className="flex items-center gap-1">
          {!guardian.primaryContact ? (
            <Button
              className="border-transparent text-foreground hover:bg-default-100"
              isDisabled={isProcessing}
              isIconOnly
              size="sm"
              variant="outline"
              onPress={() => onSetPrimary(guardianId)}
            >
              <Star className="size-4" />
            </Button>
          ) : null}
          <Button
            className="border-transparent text-accent hover:bg-accent-soft"
            isDisabled={isProcessing}
            isIconOnly
            size="sm"
            variant="outline"
            onPress={() => onEdit(guardian)}
          >
            <PencilLine className="size-4" />
          </Button>
          <Button
            className="border-transparent text-danger hover:bg-danger-soft"
            isDisabled={isProcessing}
            isIconOnly
            size="sm"
            variant="outline"
            onPress={() => onDelete(guardianId)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DetailItem label="続柄" value={guardian.relationshipName || guardian.relationshipCode} />
        <DetailItem label="電話番号" value={guardian.phone} />
        <DetailItem label="メールアドレス" value={guardian.email} />
        <DetailItem label="郵便番号" value={guardian.postalCode} />
        <DetailItem label="住所" value={guardian.address} className="md:col-span-2" />
        <DetailItem label="メモ" value={guardian.note} className="md:col-span-2" />
      </div>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value?: string | null;
  className?: string;
}

// 詳細表示用のラベル付き値を描画する。
function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={["space-y-1", className].filter(Boolean).join(" ")}>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium whitespace-pre-wrap">{value || "-"}</p>
    </div>
  );
}

interface GuardianEditModalProps {
  student: StudentFormInitialFragment;
  guardian: StudentGuardian | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 保護者の追加・編集を行うモーダル。
function GuardianEditModal({ student, guardian, isOpen, onOpenChange }: GuardianEditModalProps) {
  const form = useForm<StudentGuardianForm>({
    resolver: zodResolver(studentGuardianFormSchema),
    mode: "onSubmit",
    defaultValues: toGuardianForm(guardian),
  });
  const revalidator = useRevalidator();
  const mutation = useActionFetcher<StudentGuardianActionData>({
    defaultAction: ({ studentId }: { studentId: string }) => `/students/${studentId}/guardians`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      revalidator.revalidate();
      onOpenChange(false);
    },
  });

  // モーダルを開くたびに、現在表示中の生徒情報へ戻す。
  useEffect(() => {
    if (!isOpen) return;
    form.reset(toGuardianForm(guardian));
  }, [form, guardian, isOpen]);

  const onValid: SubmitHandler<StudentGuardianForm> = (data) => {
    if (!student.id) return;
    mutation.submit({ operation: "save", guardian: data.guardian } satisfies GuardianOperation, [
      { studentId: student.id },
    ]);
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container className="max-w-6xl" size="cover">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <PencilLine className="size-5 text-gray-700" />
              </span>
              <span>{guardian ? "保護者情報を編集" : "保護者情報を追加"}</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <GuardianFormFields form={form as unknown as UseFormReturn<StudentForm>} />
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
              isPending={mutation.submitting}
              onPress={() => void form.handleSubmit(onValid)()}
            >
              更新
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

// 保護者の取得結果をフォームへ詰め替える。
function toGuardianForm(guardian: StudentGuardian | null): StudentGuardianForm {
  return {
    guardian: {
      id: guardian?.id ?? "",
      name: guardian?.name ?? "",
      kana: guardian?.kana ?? "",
      relationshipCode: guardian?.relationshipCode ?? "",
      prefectureCode: guardian?.prefectureCode ?? "",
      phone: guardian?.phone ?? "",
      email: guardian?.email ?? "",
      postalCode: guardian?.postalCode ?? "",
      address: guardian?.address ?? "",
      note: guardian?.note ?? "",
    },
  };
}
