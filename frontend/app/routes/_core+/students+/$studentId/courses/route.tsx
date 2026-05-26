import { Button, Card, Checkbox, Input, Label, Modal, TextArea } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useLoaderData,
  useOutletContext,
  useRevalidator,
} from "react-router";
import { z } from "zod";

import { FieldErrorText } from "~/components/form/field-error-text";
import { SelectField } from "~/components/form/select-field";
import {
  type ContractInput,
  getSdk,
  type StudentContractListItemFragment,
  type SubjectOptionFragment,
} from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { StudentDetailContext } from "~/routes/_core+/students+/$studentId/route";
import { getGraphQLClient } from "~/services/graphql-client";

const courseTypeOptions = [
  { value: "regular", label: "通常" },
  { value: "trial", label: "体験" },
  { value: "seasonal", label: "季節講習" },
  { value: "other", label: "その他" },
] as const;

const weekdayOptions = [
  { value: "", label: "指定なし" },
  { value: "1", label: "月" },
  { value: "2", label: "火" },
  { value: "3", label: "水" },
  { value: "4", label: "木" },
  { value: "5", label: "金" },
  { value: "6", label: "土" },
  { value: "7", label: "日" },
] as const;

const courseFormSchema = z.object({
  courseType: z.enum(["regular", "trial", "seasonal", "other"]),
  coursePlanName: z.string().max(100).optional(),
  contractStartDate: z.string().min(1, "開始日を入力してください"),
  contractEndDate: z.string().optional(),
  subjectId: z.string().min(1, "科目を選択してください"),
  weeklyLessons: z.number().int().min(1, "週回数は1以上で入力してください"),
  preferredWeekday: z.string().optional(),
  preferredStartTime: z.string().optional(),
  preferredEndTime: z.string().optional(),
  monthlyFee: z.number().int().min(0, "単価は0以上で入力してください"),
  discountAmount: z.number().int().min(0, "割引額は0以上で入力してください"),
  seatGenerationEligible: z.boolean(),
  note: z.string().max(1000).optional(),
});

const contractOperationSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("create"), contract: courseFormSchema }),
  z.object({
    operation: z.literal("update"),
    contractId: z.string().min(1),
    contract: courseFormSchema,
  }),
  z.object({ operation: z.literal("delete"), contractId: z.string().min(1) }),
]);

type ContractOperation = z.infer<typeof contractOperationSchema>;
type CourseForm = z.infer<typeof courseFormSchema>;

// コースタブの表示に必要な契約一覧と科目候補を取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const studentId = params.studentId;
  if (!studentId) {
    throw new Response("studentId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const [{ contractsByStudentId }, { subjectOptions }] = await Promise.all([
    sdk.studentContracts({ studentId }),
    sdk.subjectOptions(),
  ]);

  return {
    contracts: (contractsByStudentId ?? []).filter(
      (contract): contract is StudentContractListItemFragment => Boolean(contract),
    ),
    subjects: (subjectOptions ?? []).filter((subject): subject is SubjectOptionFragment =>
      Boolean(subject),
    ),
  };
};

// コースタブの作成・更新・削除操作を実行する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const studentId = params.studentId;
  if (!studentId) {
    throw new Response("studentId is required", { status: 400 });
  }

  const payload = contractOperationSchema.parse(await request.json());
  const client = getGraphQLClient();
  const sdk = getSdk(client);

  if (payload.operation === "delete") {
    const { deleteStudentContract } = await sdk.deleteStudentContract({
      contractId: payload.contractId,
    });
    return {
      message: deleteStudentContract ? "ok" : "ng",
      notify: deleteStudentContract
        ? { type: "success" as const, message: "コースを削除しました" }
        : { type: "error" as const, message: "削除に失敗しました" },
    };
  }

  if (payload.operation === "update") {
    const { updateStudentContract } = await sdk.updateStudentContract({
      contractId: payload.contractId,
      input: toContractInput(payload.contract),
    });
    return {
      message: updateStudentContract ? "ok" : "ng",
      contract: updateStudentContract ?? undefined,
      notify: updateStudentContract
        ? { type: "success" as const, message: "コースを更新しました" }
        : { type: "error" as const, message: "更新に失敗しました" },
    };
  }

  const { createStudentContract } = await sdk.createStudentContract({
    studentId,
    input: toContractInput(payload.contract),
  });
  return {
    message: createStudentContract ? "ok" : "ng",
    contract: createStudentContract ?? undefined,
    notify: createStudentContract
      ? { type: "success" as const, message: "コースを登録しました" }
      : { type: "error" as const, message: "登録に失敗しました" },
  };
};

type StudentCoursesActionData = Awaited<ReturnType<typeof clientAction>>;

// 生徒詳細のコースタブ。
export default function StudentCoursesRoute() {
  const { student } = useOutletContext<StudentDetailContext>();
  const { contracts, subjects } = useLoaderData<typeof clientLoader>();
  const subjectNameMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject.name ?? subject.id ?? ""])),
    [subjects],
  );
  const [editingContract, setEditingContract] = useState<StudentContractListItemFragment | null>(
    null,
  );
  const [isFormOpen, setFormOpen] = useState(false);
  const revalidator = useRevalidator();
  const deleteMutation = useActionFetcher<StudentCoursesActionData>({
    defaultAction: ({ studentId }: { studentId: string }) => `/students/${studentId}/courses`,
    method: "post",
    encType: "application/json",
    onSuccess: () => revalidator.revalidate(),
  });

  // 新規登録モーダルを開く。
  const openCreateModal = () => {
    setEditingContract(null);
    setFormOpen(true);
  };

  // 編集モーダルを開く。
  const openEditModal = (contract: StudentContractListItemFragment) => {
    setEditingContract(contract);
    setFormOpen(true);
  };

  // コースを論理削除する。
  const deleteContract = (contractId?: string | null) => {
    if (!student.id || !contractId) return;
    deleteMutation.submit({ operation: "delete", contractId } satisfies ContractOperation, [
      { studentId: student.id },
    ]);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-surface">
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">コース</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                コース期間、科目、売上からの座席展開対象を管理します。
              </p>
            </div>
            <Button className="app-primary-button" onPress={openCreateModal}>
              <Plus className="size-4" />
              コース登録
            </Button>
          </div>

          {contracts.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full min-w-[840px] text-left text-sm">
                <thead className="bg-default-100 text-muted-foreground text-xs">
                  <tr>
                    <th className="px-3 py-2 font-medium">種別</th>
                    <th className="px-3 py-2 font-medium">プラン</th>
                    <th className="px-3 py-2 font-medium">期間</th>
                    <th className="px-3 py-2 font-medium">科目</th>
                    <th className="px-3 py-2 font-medium">週回数</th>
                    <th className="px-3 py-2 font-medium">単価</th>
                    <th className="px-3 py-2 font-medium">座席展開</th>
                    <th className="px-3 py-2 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="bg-surface">
                      <td className="px-3 py-3">{formatCourseType(contract.courseType)}</td>
                      <td className="px-3 py-3">{contract.coursePlanName || "-"}</td>
                      <td className="px-3 py-3">
                        {formatDate(contract.contractStartDate)} -{" "}
                        {formatDate(contract.contractEndDate) || "継続中"}
                      </td>
                      <td className="px-3 py-3">
                        {subjectNameMap.get(contract.subjectId ?? "") || contract.subjectId || "-"}
                      </td>
                      <td className="px-3 py-3">{contract.weeklyLessons ?? "-"}</td>
                      <td className="px-3 py-3">{formatCurrency(contract.monthlyFee)}</td>
                      <td className="px-3 py-3">
                        {contract.seatGenerationEligible ? "対象" : "対象外"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => openEditModal(contract)}
                          >
                            <PencilLine className="size-4" />
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => deleteContract(contract.id)}
                          >
                            <Trash2 className="size-4" />
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3 rounded-lg border border-dashed border-border/70 p-8 text-center">
              <p className="text-muted-foreground text-sm">コースはまだ登録されていません</p>
              <Button className="app-primary-button" onPress={openCreateModal}>
                <Plus className="size-4" />
                最初のコースを登録
              </Button>
            </div>
          )}
        </div>
      </Card>

      <CourseFormModal
        contract={editingContract}
        isOpen={isFormOpen}
        studentId={student.id ?? ""}
        subjects={subjects}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}

// フォーム値を GraphQL の ContractInput へ変換する。
function toContractInput(contract: CourseForm): ContractInput {
  return {
    courseType: contract.courseType,
    coursePlanName: contract.coursePlanName || undefined,
    contractStartDate: contract.contractStartDate,
    contractEndDate: contract.contractEndDate || undefined,
    subjectId: contract.subjectId,
    weeklyLessons: Number(contract.weeklyLessons),
    preferredWeekday: contract.preferredWeekday ? Number(contract.preferredWeekday) : undefined,
    preferredStartTime: contract.preferredStartTime || undefined,
    preferredEndTime: contract.preferredEndTime || undefined,
    monthlyFee: Number(contract.monthlyFee),
    discountAmount: Number(contract.discountAmount),
    seatGenerationEligible: contract.seatGenerationEligible,
    note: contract.note || undefined,
  };
}

interface CourseFormModalProps {
  studentId: string;
  contract: StudentContractListItemFragment | null;
  subjects: SubjectOptionFragment[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// コースの追加・編集を行うモーダル。
function CourseFormModal({
  studentId,
  contract,
  subjects,
  isOpen,
  onOpenChange,
}: CourseFormModalProps) {
  const form = useForm<CourseForm>({
    resolver: zodResolver(courseFormSchema),
    mode: "onSubmit",
    defaultValues: toCourseForm(contract),
  });
  const revalidator = useRevalidator();
  const mutation = useActionFetcher<StudentCoursesActionData>({
    defaultAction: ({ studentId }: { studentId: string }) => `/students/${studentId}/courses`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      revalidator.revalidate();
      onOpenChange(false);
    },
  });
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // モーダルを開くたびに対象コースの値へ戻す。
  useEffect(() => {
    if (!isOpen) return;
    form.reset(toCourseForm(contract));
  }, [contract, form, isOpen]);

  const onValid: SubmitHandler<CourseForm> = (data) => {
    if (!studentId) return;
    if (contract?.id) {
      mutation.submit(
        {
          operation: "update",
          contractId: contract.id,
          contract: data,
        } satisfies ContractOperation,
        [{ studentId }],
      );
      return;
    }
    mutation.submit({ operation: "create", contract: data } satisfies ContractOperation, [
      { studentId },
    ]);
  };

  const subjectItems = subjects
    .filter((subject) => subject.id != null)
    .map((subject) => ({
      id: String(subject.id),
      textValue: subject.name ?? subject.code ?? "",
      content: subject.name ?? subject.code ?? "",
    }));

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container className="max-w-6xl" size="cover">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="text-xl">
              {contract ? "コース編集" : "コース登録"}
            </Modal.Heading>
          </Modal.Header>
          <form onSubmit={form.handleSubmit(onValid)}>
            <Modal.Body>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <SelectField
                    ariaLabel="コース種別"
                    isRequired
                    items={courseTypeOptions.map((option) => ({
                      id: option.value,
                      textValue: option.label,
                      content: option.label,
                    }))}
                    label="コース種別"
                    value={watch("courseType")}
                    onChange={(value) =>
                      setValue("courseType", value as CourseForm["courseType"], {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  <FieldErrorText message={errors.courseType?.message} />
                </div>

                <div className="space-y-1">
                  <Label className="block">コースプラン</Label>
                  <Input {...register("coursePlanName")} placeholder="例: 週2回 標準" />
                  <FieldErrorText message={errors.coursePlanName?.message} />
                </div>

                <div className="space-y-1">
                  <Label className="block" isRequired>
                    開始日
                  </Label>
                  <Input type="date" {...register("contractStartDate")} />
                  <FieldErrorText message={errors.contractStartDate?.message} />
                </div>

                <div className="space-y-1">
                  <Label className="block">終了日</Label>
                  <Input type="date" {...register("contractEndDate")} />
                  <FieldErrorText message={errors.contractEndDate?.message} />
                </div>

                <div className="space-y-1">
                  <SelectField
                    ariaLabel="科目"
                    emptyState="選択できる科目がありません"
                    isRequired
                    items={subjectItems}
                    label="科目"
                    value={watch("subjectId")}
                    onChange={(value) =>
                      setValue("subjectId", value, { shouldDirty: true, shouldValidate: true })
                    }
                  />
                  <FieldErrorText message={errors.subjectId?.message} />
                </div>

                <div className="space-y-1">
                  <Label className="block" isRequired>
                    週回数
                  </Label>
                  <Input
                    min={1}
                    type="number"
                    {...register("weeklyLessons", { valueAsNumber: true })}
                  />
                  <FieldErrorText message={errors.weeklyLessons?.message} />
                </div>

                <div className="space-y-1">
                  <SelectField
                    ariaLabel="希望曜日"
                    items={weekdayOptions.map((option) => ({
                      id: option.value,
                      textValue: option.label,
                      content: option.label,
                    }))}
                    label="希望曜日"
                    value={watch("preferredWeekday") ?? ""}
                    onChange={(value) =>
                      setValue("preferredWeekday", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  <FieldErrorText message={errors.preferredWeekday?.message} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="block">希望開始</Label>
                    <Input type="time" {...register("preferredStartTime")} />
                  </div>
                  <div className="space-y-1">
                    <Label className="block">希望終了</Label>
                    <Input type="time" {...register("preferredEndTime")} />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="block" isRequired>
                    単価
                  </Label>
                  <Input
                    min={0}
                    type="number"
                    {...register("monthlyFee", { valueAsNumber: true })}
                  />
                  <FieldErrorText message={errors.monthlyFee?.message} />
                </div>

                <div className="space-y-1">
                  <Label className="block" isRequired>
                    割引額
                  </Label>
                  <Input
                    min={0}
                    type="number"
                    {...register("discountAmount", { valueAsNumber: true })}
                  />
                  <FieldErrorText message={errors.discountAmount?.message} />
                </div>

                <Checkbox.Root
                  className="items-start md:col-span-2"
                  isSelected={watch("seatGenerationEligible")}
                  onChange={(nextValue) =>
                    setValue("seatGenerationEligible", nextValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <Checkbox.Control className="border-border bg-default-50 text-primary">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">座席展開対象</span>
                    <span className="text-muted-foreground text-xs">
                      売上から座席を作成する対象コースとして扱います。
                    </span>
                  </Checkbox.Content>
                </Checkbox.Root>

                <div className="space-y-1 md:col-span-2">
                  <Label className="block">メモ</Label>
                  <TextArea {...register("note")} rows={3} />
                  <FieldErrorText message={errors.note?.message} />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" variant="outline" onPress={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button
                className="app-primary-button"
                isDisabled={mutation.state !== "idle"}
                type="submit"
              >
                {contract ? "更新" : "登録"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

// コースデータをフォーム初期値へ変換する。
function toCourseForm(contract: StudentContractListItemFragment | null): CourseForm {
  return {
    courseType: (contract?.courseType as CourseForm["courseType"]) ?? "regular",
    coursePlanName: contract?.coursePlanName ?? "",
    contractStartDate: contract?.contractStartDate ?? "",
    contractEndDate: contract?.contractEndDate ?? "",
    subjectId: contract?.subjectId ?? "",
    weeklyLessons: contract?.weeklyLessons ?? 1,
    preferredWeekday: contract?.preferredWeekday ? String(contract.preferredWeekday) : "",
    preferredStartTime: contract?.preferredStartTime?.slice(0, 5) ?? "",
    preferredEndTime: contract?.preferredEndTime?.slice(0, 5) ?? "",
    monthlyFee: contract?.monthlyFee ?? 0,
    discountAmount: contract?.discountAmount ?? 0,
    seatGenerationEligible: contract?.seatGenerationEligible ?? true,
    note: contract?.note ?? "",
  };
}

// コース種別コードを表示名へ変換する。
function formatCourseType(courseType?: string | null) {
  return courseTypeOptions.find((option) => option.value === courseType)?.label ?? "-";
}

// 日付文字列を表示用に整形する。
function formatDate(value?: string | null) {
  if (!value) return "";
  return value;
}

// 金額を表示用に整形する。
function formatCurrency(value?: number | null) {
  return `${Number(value ?? 0).toLocaleString()}円`;
}
