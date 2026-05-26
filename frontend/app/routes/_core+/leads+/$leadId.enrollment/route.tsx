import {
  Button,
  Calendar,
  Card,
  Checkbox,
  Chip,
  DateField,
  DatePicker,
  Input,
  Label,
  TextArea,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from "react-router";
import { z } from "zod";

import { FieldErrorText } from "~/components/form/field-error-text";
import { GuardianFormFields } from "~/components/form/guardian-form-fields";
import { MasterSelectField } from "~/components/form/master-select-field";
import { getSdk, type LeadEnrollmentInput } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { useMasterPrefectures, useMasterRelationships } from "~/hooks/useMasterData";
import { usePostalCodeAutofill } from "~/hooks/usePostalCodeAutofill";
import { requiredDateString, requiredString } from "~/lib/zod-helpers";
import { formatLeadStatus, leadStatusColor } from "~/routes/_core+/leads+/_index/lead-status";
import { StudentFormFields } from "~/routes/_core+/students+/_index/components/student-form-fields";
import {
  emptyStudentForm,
  type StudentBaseForm,
  type StudentForm,
  studentFormSchema,
} from "~/routes/_core+/students+/_index/student-form-schema";
import { getGraphQLClient } from "~/services/graphql-client";

const dateGroupClassName =
  "border-border w-full rounded-lg border bg-default-50 shadow-sm outline-none ring-0 " +
  "focus-within:!border-border focus-within:!outline-none focus-within:!ring-0 " +
  "data-[focus-within=true]:!border-border data-[focus-within=true]:!shadow-sm data-[focus-within=true]:!ring-0";
const dateSegmentClassName =
  "focus:!bg-default-100 focus:!text-foreground data-[focused=true]:!bg-default-100 data-[focused=true]:!text-foreground";
const compactSectionClassName =
  "grid gap-3 border-separator/60 border-t pt-3 first:border-t-0 first:pt-0 lg:grid-cols-[7rem_1fr]";
const compactSectionTitleClassName = "text-muted-foreground pt-1 text-xs font-semibold";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const requiredPostalCode = () =>
  requiredString("郵便番号").regex(/^\d{3}-?\d{4}$/, {
    message: "郵便番号は xxx-xxxx または xxxxxxx の形式で入力してください",
  });
const requiredPhone = () =>
  requiredString("電話番号")
    .max(20)
    .regex(/^[0-9+\-()\s]{10,20}$/, {
      message: "電話番号は半角数字、ハイフン、括弧、+で入力してください",
    });
const requiredEmailString = (fieldLabel: string) =>
  z
    .string(`${fieldLabel}を入力してください`)
    .trim()
    .min(1, { message: `${fieldLabel}を入力してください` })
    .email("有効なメールアドレスを入力してください");

const billingContactFormSchema = z.object({
  sameAsGuardian: z.boolean(),
  id: optionalText(21),
  name: requiredString("請求先名").max(100),
  kana: requiredString("請求先フリガナ").max(100),
  prefectureCode: requiredString("都道府県"),
  phone: requiredPhone(),
  email: requiredEmailString("請求先メールアドレス"),
  postalCode: requiredPostalCode(),
  address: requiredString("住所").max(255),
  note: optionalText(1000),
});

const enrollmentFormSchema = studentFormSchema
  .extend({
    enrollmentDate: requiredDateString("入会日"),
    billingContact: billingContactFormSchema,
  })
  .superRefine((value, ctx) => {
    if (!value.guardian.name?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "保護者名を入力してください",
        path: ["guardian", "name"],
      });
    }
    if (!value.guardian.prefectureCode?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "保護者の都道府県を選択してください",
        path: ["guardian", "prefectureCode"],
      });
    }
  });

type EnrollmentForm = z.infer<typeof enrollmentFormSchema>;
type EnrollLeadActionData = Awaited<ReturnType<typeof clientAction>>;
type StepKey = "student" | "guardian" | "billing" | "confirm";

const steps: Array<{ key: StepKey; label: string }> = [
  { key: "student", label: "生徒情報" },
  { key: "guardian", label: "保護者情報" },
  { key: "billing", label: "請求連絡先" },
  { key: "confirm", label: "確認" },
];

// 入会処理に必要なリード情報を取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { leadById } = await sdk.leadById({ leadId });
  if (!leadById?.id) {
    throw new Response("lead not found", { status: 404 });
  }

  const [schoolCode, schoolGradeCode] = await Promise.all([
    findSchoolCodeByName(sdk, leadById.schoolName),
    findSchoolGradeCodeByName(sdk, leadById.gradeName),
  ]);

  return { lead: leadById, schoolCode, schoolGradeCode };
};

// 入会フォームから専用 GraphQL mutation へ登録する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const input = (await request.json()) as LeadEnrollmentInput;
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { enrollLead } = await sdk.enrollLead({ leadId, input });

  return {
    message: enrollLead ? "ok" : "ng",
    student: enrollLead ?? undefined,
    notify: enrollLead
      ? { type: "success" as const, message: "入会処理を完了しました" }
      : { type: "error" as const, message: "入会処理に失敗しました" },
  };
};

export function meta() {
  return [{ title: "入会処理" }, { name: "description", content: "リードから生徒を入会登録" }];
}

const todayYmd = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const trimToNull = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const findSchoolCodeByName = async (sdk: ReturnType<typeof getSdk>, schoolName?: string | null) => {
  const trimmed = trimToNull(schoolName);
  if (!trimmed) return "";
  const { schoolPagination } = await sdk.schoolPagination({
    pagination: { offset: 0, limit: 10 },
    filter: { name: trimmed },
  });
  const matched = (schoolPagination?.contents ?? []).find(
    (school) => school?.name?.trim() === trimmed,
  );
  return matched?.code ?? "";
};

const findSchoolGradeCodeByName = async (
  sdk: ReturnType<typeof getSdk>,
  gradeName?: string | null,
) => {
  const trimmed = trimToNull(gradeName);
  if (!trimmed) return "";
  const { allSchoolGrades } = await sdk.allSchoolGrades();
  const matched = (allSchoolGrades ?? []).find((grade) => grade?.name?.trim() === trimmed);
  return matched?.code ?? "";
};

const emptyEnrollmentForm: EnrollmentForm = {
  ...emptyStudentForm,
  enrollmentDate: todayYmd(),
  billingContact: {
    sameAsGuardian: true,
    id: "",
    name: "",
    kana: "",
    prefectureCode: "",
    phone: "",
    email: "",
    postalCode: "",
    address: "",
    note: "",
  },
};

const normalizeBlank = (value?: string | null) => value?.trim() ?? "";

// 保護者情報を請求連絡先へ転記する。
const copyGuardianToBillingContact = (
  form: UseFormReturn<EnrollmentForm>,
  options: { shouldDirty?: boolean; shouldValidate?: boolean } = {},
) => {
  const guardian = form.getValues("guardian");
  const option = {
    shouldDirty: options.shouldDirty ?? true,
    shouldValidate: options.shouldValidate ?? true,
  };
  form.setValue("billingContact.name", guardian.name ?? "", option);
  form.setValue("billingContact.kana", guardian.kana ?? "", option);
  form.setValue("billingContact.phone", guardian.phone ?? "", option);
  form.setValue("billingContact.email", guardian.email ?? "", option);
  form.setValue("billingContact.postalCode", guardian.postalCode ?? "", option);
  form.setValue("billingContact.prefectureCode", guardian.prefectureCode ?? "", option);
  form.setValue("billingContact.address", guardian.address ?? "", option);
};

// リードを起点にした新規入会登録画面。
export default function LeadEnrollmentRoute() {
  const { lead, schoolCode, schoolGradeCode } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<StepKey>("student");

  const form = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentFormSchema),
    mode: "onSubmit",
    defaultValues: emptyEnrollmentForm,
  });

  const mutation = useActionFetcher<EnrollLeadActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}/enrollment`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      navigate("/students");
    },
  });

  // lead の値を初期値としてフォームへ流し込む。
  useEffect(() => {
    form.reset({
      ...emptyEnrollmentForm,
      name: lead.studentName ?? "",
      kana: lead.studentKana ?? "",
      branchId: lead.branchId ?? "",
      schoolCode,
      schoolGradeCode,
      note: lead.note ?? "",
      guardian: {
        ...emptyStudentForm.guardian,
        name: lead.guardianName ?? "",
        kana: lead.guardianKana ?? "",
        phone: lead.phone ?? "",
        email: lead.email ?? "",
      },
      billingContact: {
        ...emptyEnrollmentForm.billingContact,
        sameAsGuardian: true,
        name: lead.guardianName ?? "",
        kana: lead.guardianKana ?? "",
        phone: lead.phone ?? "",
        email: lead.email ?? "",
      },
    });
  }, [form, lead, schoolCode, schoolGradeCode]);

  const sameAsGuardian = form.watch("billingContact.sameAsGuardian");
  const guardianName = form.watch("guardian.name");
  const guardianKana = form.watch("guardian.kana");
  const guardianPhone = form.watch("guardian.phone");
  const guardianEmail = form.watch("guardian.email");
  const guardianPostalCode = form.watch("guardian.postalCode");
  const guardianPrefectureCode = form.watch("guardian.prefectureCode");
  const guardianAddress = form.watch("guardian.address");
  const { data: relationships } = useMasterRelationships();

  // 「保護者情報と同じ」が有効な間は、保護者編集に追従して請求先を更新する。
  useEffect(() => {
    if (!sameAsGuardian) return;
    const option = { shouldDirty: true, shouldValidate: false };
    form.setValue("billingContact.name", guardianName ?? "", option);
    form.setValue("billingContact.kana", guardianKana ?? "", option);
    form.setValue("billingContact.phone", guardianPhone ?? "", option);
    form.setValue("billingContact.email", guardianEmail ?? "", option);
    form.setValue("billingContact.postalCode", guardianPostalCode ?? "", option);
    form.setValue("billingContact.prefectureCode", guardianPrefectureCode ?? "", option);
    form.setValue("billingContact.address", guardianAddress ?? "", option);
  }, [
    form,
    sameAsGuardian,
    guardianName,
    guardianKana,
    guardianPhone,
    guardianEmail,
    guardianPostalCode,
    guardianPrefectureCode,
    guardianAddress,
  ]);

  const activeStepIndex = steps.findIndex((step) => step.key === currentStep);
  const canEnroll = lead.status === "contracted";
  const values = form.watch();
  const previewBillingContact = values.billingContact;

  const handleNext = async () => {
    const isValid = await validateStep(form, currentStep);
    if (!isValid) return;
    const nextStep = steps[activeStepIndex + 1];
    if (nextStep) setCurrentStep(nextStep.key);
  };

  const handlePrevious = () => {
    const previousStep = steps[activeStepIndex - 1];
    if (previousStep) setCurrentStep(previousStep.key);
  };

  // 入会フォーム全体の検証後、GraphQL 入力のモデル単位へ変換して送信する。
  const onValid: SubmitHandler<EnrollmentForm> = (data) => {
    if (!lead.id) return;
    const billingContact = data.billingContact;
    const input = {
      enrollmentDate: data.enrollmentDate,
      student: {
        code: data.code,
        name: data.name,
        kana: data.kana,
        birthday: data.birthday,
        genderCode: data.genderCode,
        schoolCode: data.schoolCode,
        branchId: data.branchId,
        schoolGradeCode: data.schoolGradeCode,
        status: data.status,
        note: data.note,
      },
      guardian: data.guardian,
      billingContact: {
        id: billingContact.id,
        name: normalizeBlank(billingContact.name),
        kana: billingContact.kana,
        prefectureCode: billingContact.prefectureCode,
        phone: billingContact.phone,
        email: normalizeBlank(billingContact.email),
        postalCode: billingContact.postalCode,
        address: billingContact.address,
        note: billingContact.note,
      },
    };
    mutation.submit(input, [{ leadId: lead.id }]);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-surface">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">リード状態</p>
            <Chip color={leadStatusColor(lead.status)} size="sm" variant="soft">
              {formatLeadStatus(lead.status)}
            </Chip>
          </div>
          <SummaryCell label="生徒名" value={lead.studentName} />
          <SummaryCell label="保護者名" value={lead.guardianName} />
          <SummaryCell label="拠点" value={lead.branch?.name ?? lead.branch?.code} />
        </div>
      </Card>

      {!canEnroll ? (
        <Card className="border-border/60 bg-surface">
          <div className="space-y-3 p-5">
            <h2 className="text-base font-semibold">入会処理を開始できません</h2>
            <p className="text-muted-foreground text-sm">
              入会処理はリード状態が「成約」の場合だけ実行できます。
            </p>
          </div>
        </Card>
      ) : (
        <Card className="border-border/60 bg-surface">
          <div className="space-y-5 p-5">
            <StepNav currentStep={currentStep} onSelect={setCurrentStep} />

            {currentStep === "student" ? (
              <div className="space-y-3">
                <section className={compactSectionClassName}>
                  <h3 className={compactSectionTitleClassName}>入会情報</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <EnrollmentDateField form={form} />
                  </div>
                </section>
                <StudentFormFields
                  form={form as unknown as UseFormReturn<StudentBaseForm>}
                  layout="dense"
                />
              </div>
            ) : null}

            {currentStep === "guardian" ? (
              <GuardianFormFields
                form={form as unknown as UseFormReturn<StudentForm>}
                layout="dense"
                variant="fields"
              />
            ) : null}

            {currentStep === "billing" ? <BillingContactFormFields form={form} /> : null}

            {currentStep === "confirm" ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <ConfirmSection
                  title="生徒情報"
                  rows={[
                    ["入会日", values.enrollmentDate],
                    ["生徒NO", values.code],
                    ["氏名", values.name],
                    ["フリガナ", values.kana],
                    ["生年月日", values.birthday],
                  ]}
                />
                <ConfirmSection
                  title="保護者情報"
                  rows={[
                    ["氏名", values.guardian.name],
                    ["フリガナ", values.guardian.kana],
                    [
                      "続柄",
                      resolveRelationshipName(values.guardian.relationshipCode, relationships),
                    ],
                    ["電話番号", values.guardian.phone],
                    ["メール", values.guardian.email],
                  ]}
                />
                <ConfirmSection
                  title="請求連絡先"
                  rows={[
                    ["請求方法", "クレジットカード"],
                    ["氏名・宛名", previewBillingContact.name],
                    ["フリガナ", previewBillingContact.kana],
                    ["電話番号", previewBillingContact.phone],
                    ["メール", previewBillingContact.email],
                    ["住所", previewBillingContact.address],
                  ]}
                />
              </div>
            ) : null}

            <div className="flex flex-wrap justify-between gap-2">
              <Button
                className="border-border text-foreground hover:bg-default-100"
                variant="outline"
                onPress={() => navigate(`/leads/${lead.id}`)}
              >
                キャンセル
              </Button>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  className="border-border text-foreground hover:bg-default-100"
                  isDisabled={activeStepIndex === 0}
                  variant="outline"
                  onPress={handlePrevious}
                >
                  <ChevronLeft className="size-4" />
                  戻る
                </Button>
                {currentStep === "confirm" ? (
                  <Button
                    className="app-primary-button"
                    isPending={mutation.state !== "idle"}
                    onPress={() => {
                      void form.handleSubmit(onValid)();
                    }}
                  >
                    <CheckCircle2 className="size-4" />
                    入会登録
                  </Button>
                ) : (
                  <Button className="app-primary-button" onPress={() => void handleNext()}>
                    次へ
                    <ChevronRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// 現在のステップで操作する項目だけを検証する。
async function validateStep(form: UseFormReturn<EnrollmentForm>, step: StepKey) {
  if (step === "student") {
    return form.trigger([
      "enrollmentDate",
      "code",
      "name",
      "kana",
      "birthday",
      "genderCode",
      "branchId",
      "schoolCode",
      "schoolGradeCode",
      "status",
      "note",
    ]);
  }
  if (step === "guardian") {
    return form.trigger([
      "guardian.name",
      "guardian.kana",
      "guardian.relationshipCode",
      "guardian.phone",
      "guardian.email",
      "guardian.postalCode",
      "guardian.prefectureCode",
      "guardian.address",
      "guardian.note",
    ]);
  }
  if (step === "billing") {
    return form.trigger([
      "billingContact.name",
      "billingContact.kana",
      "billingContact.phone",
      "billingContact.email",
      "billingContact.postalCode",
      "billingContact.prefectureCode",
      "billingContact.address",
      "billingContact.note",
    ]);
  }
  return form.trigger();
}

// 続柄コードから表示名を引き当てる。
function resolveRelationshipName(
  relationshipCode: string | undefined | null,
  relationships?: { code?: string | null; name?: string | null }[],
) {
  const code = relationshipCode?.trim();
  if (!code) return "-";
  const matched = relationships?.find((relationship) => relationship?.code === code);
  return matched?.name ?? code;
}

function StepNav({
  currentStep,
  onSelect,
}: {
  currentStep: StepKey;
  onSelect: (step: StepKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        return (
          <Button
            key={step.key}
            className={
              isActive
                ? "app-primary-button justify-start"
                : "border-border justify-start text-foreground hover:bg-default-100"
            }
            variant={isActive ? "primary" : "outline"}
            onPress={() => onSelect(step.key)}
          >
            <span className="grid size-5 place-items-center rounded-full bg-current/10 text-xs">
              {index + 1}
            </span>
            <span>{step.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

function EnrollmentDateField({ form }: { form: UseFormReturn<EnrollmentForm> }) {
  const enrollmentDate = form.watch("enrollmentDate");
  const error = form.formState.errors.enrollmentDate;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,20rem)]">
      <div className="space-y-1">
        <Label className="block" isRequired>
          入会日
        </Label>
        <DatePicker
          aria-label="入会日"
          className="w-full"
          isInvalid={Boolean(error)}
          isRequired
          name="enrollmentDate"
          value={enrollmentDate ? parseDate(enrollmentDate) : null}
          onChange={(value) => {
            form.setValue("enrollmentDate", value ? value.toString() : "", {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        >
          <DateField.Group className={dateGroupClassName}>
            <DateField.Input>
              {(segment) => (
                <DateField.Segment className={dateSegmentClassName} segment={segment}>
                  {["month", "day"].includes(segment.type) && !segment.isPlaceholder
                    ? String(segment.value).padStart(2, "0")
                    : segment.text}
                </DateField.Segment>
              )}
            </DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger className="text-foreground hover:bg-default-100 data-[pressed=true]:bg-default-200">
                <DatePicker.TriggerIndicator className="text-foreground" />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DatePicker.Popover>
            <Calendar aria-label="入会日">
              <Calendar.Header>
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => <Calendar.YearPickerCell year={year} />}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
          </DatePicker.Popover>
        </DatePicker>
        <FieldErrorText message={error?.message} />
      </div>
    </div>
  );
}

function BillingContactFormFields({ form }: { form: UseFormReturn<EnrollmentForm> }) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const { data: prefectures } = useMasterPrefectures();
  const postalCode = watch("billingContact.postalCode");
  const sameAsGuardian = Boolean(watch("billingContact.sameAsGuardian"));
  const billingContact = watch("billingContact");

  // 郵便番号から都道府県と住所を補完する。
  usePostalCodeAutofill({
    zipCode: sameAsGuardian ? "" : (postalCode ?? ""),
    prefectures: prefectures ?? [],
    onAutofill: (result) => {
      setValue("billingContact.postalCode", result.zipcode, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("billingContact.prefectureCode", result.prefectureCode, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("billingContact.address", result.address, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
  });

  return (
    <div className="space-y-3">
      <section className={compactSectionClassName}>
        <h3 className={compactSectionTitleClassName}>請求設定</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Checkbox.Root
            className="items-start md:col-span-2"
            isSelected={sameAsGuardian}
            onChange={(nextValue) => {
              setValue("billingContact.sameAsGuardian", nextValue, {
                shouldDirty: true,
                shouldValidate: false,
              });
              if (nextValue) {
                copyGuardianToBillingContact(form);
              }
            }}
          >
            <Checkbox.Control className="border-border bg-default-50 text-primary">
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content className="flex flex-col gap-1">
              <span className="text-sm font-semibold">保護者情報と同じ連絡先を使う</span>
              <span className="text-muted-foreground text-xs">
                チェック中は保護者情報を請求連絡先へ自動反映します。
              </span>
            </Checkbox.Content>
          </Checkbox.Root>

          <div className="space-y-1">
            <Label className="block">請求方法</Label>
            <div className="border-border flex h-10 items-center rounded-lg border bg-default-50 px-3 text-sm font-medium">
              クレジットカード
            </div>
          </div>
        </div>
      </section>

      {sameAsGuardian ? (
        <section className={compactSectionClassName}>
          <h3 className={compactSectionTitleClassName}>反映内容</h3>
          <BillingContactCopySummary
            messages={[
              { key: "name", message: errors.billingContact?.name?.message },
              { key: "email", message: errors.billingContact?.email?.message },
              { key: "phone", message: errors.billingContact?.phone?.message },
              { key: "postalCode", message: errors.billingContact?.postalCode?.message },
              { key: "prefectureCode", message: errors.billingContact?.prefectureCode?.message },
              { key: "address", message: errors.billingContact?.address?.message },
            ]}
            prefectures={prefectures ?? []}
            values={billingContact}
          />
        </section>
      ) : (
        <>
          <section className={compactSectionClassName}>
            <h3 className={compactSectionTitleClassName}>宛先</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-1">
                <Label className="block" isRequired>
                  請求先名
                </Label>
                <Input
                  aria-label="請求先名"
                  className="w-full"
                  placeholder="例) 山田 花子"
                  {...register("billingContact.name")}
                />
                <FieldErrorText message={errors.billingContact?.name?.message} />
              </div>
              <div className="space-y-1">
                <Label className="block">フリガナ</Label>
                <Input
                  aria-label="請求先フリガナ"
                  className="w-full"
                  placeholder="例) ヤマダ ハナコ"
                  {...register("billingContact.kana")}
                />
                <FieldErrorText message={errors.billingContact?.kana?.message} />
              </div>
            </div>
          </section>

          <section className={compactSectionClassName}>
            <h3 className={compactSectionTitleClassName}>連絡先</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-1">
                <Label className="block">電話番号</Label>
                <Input
                  aria-label="請求先電話番号"
                  className="w-full"
                  placeholder="例) 090-1234-5678"
                  {...register("billingContact.phone")}
                />
                <FieldErrorText message={errors.billingContact?.phone?.message} />
              </div>
              <div className="space-y-1">
                <Label className="block" isRequired>
                  メールアドレス
                </Label>
                <Input
                  aria-label="請求先メールアドレス"
                  className="w-full"
                  placeholder="例) billing@example.com"
                  type="email"
                  {...register("billingContact.email")}
                />
                <FieldErrorText message={errors.billingContact?.email?.message} />
              </div>
            </div>
          </section>

          <section className={compactSectionClassName}>
            <h3 className={compactSectionTitleClassName}>住所</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-1">
                <Label className="block">郵便番号</Label>
                <Input
                  aria-label="請求先郵便番号"
                  className="w-full"
                  placeholder="例) 123-4567"
                  {...register("billingContact.postalCode")}
                />
                <FieldErrorText message={errors.billingContact?.postalCode?.message} />
              </div>
              <div className="space-y-1">
                <MasterSelectField
                  ariaLabel="請求先の都道府県"
                  emptyState="該当する都道府県がありません"
                  form={form}
                  label="都道府県"
                  name="billingContact.prefectureCode"
                  useOptions={useMasterPrefectures}
                />
              </div>
              <div className="space-y-1 md:col-span-2 xl:col-span-3">
                <Label className="block">住所</Label>
                <Input
                  aria-label="請求先住所"
                  className="w-full"
                  placeholder="例) 名古屋市中区..."
                  {...register("billingContact.address")}
                />
                <FieldErrorText message={errors.billingContact?.address?.message} />
              </div>
            </div>
          </section>

          <section className={compactSectionClassName}>
            <h3 className={compactSectionTitleClassName}>補足</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-1 md:col-span-2 xl:col-span-3">
                <Label className="block">メモ</Label>
                <TextArea
                  aria-label="請求先メモ"
                  className="border-border w-full rounded-lg border bg-default-50 shadow-sm"
                  rows={3}
                  placeholder="補足があれば入力"
                  {...register("billingContact.note")}
                />
                <FieldErrorText message={errors.billingContact?.note?.message} />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function BillingContactCopySummary({
  values,
  messages,
  prefectures,
}: {
  values: EnrollmentForm["billingContact"];
  messages: Array<{ key: string; message?: string }>;
  prefectures: Array<{ code?: string | null; name?: string | null }>;
}) {
  const prefectureName =
    prefectures.find((prefecture) => prefecture.code === values.prefectureCode)?.name ??
    values.prefectureCode;

  return (
    <div>
      <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
        {[
          ["請求先名", values.name],
          ["フリガナ", values.kana],
          ["電話番号", values.phone],
          ["メール", values.email],
          ["郵便番号", values.postalCode],
          ["都道府県", prefectureName],
          ["住所", values.address],
        ].map(([label, value]) => (
          <div className="min-w-0" key={label}>
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="break-words font-medium">{value || "-"}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 space-y-1">
        {messages.map(({ key, message }) => (
          <FieldErrorText key={key} message={message} />
        ))}
      </div>
    </div>
  );
}

function ConfirmSection({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string | null | undefined]>;
}) {
  return (
    <section className="rounded-medium border border-separator/60 bg-surface/30 p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      <dl className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 text-sm" key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 break-words font-medium">{value || "-"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SummaryCell({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium">{value ?? "-"}</p>
    </div>
  );
}
