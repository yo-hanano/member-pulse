import { Button, Card, Input, Label, Modal, TextArea, useFilter } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { type ActionFunctionArgs, useOutletContext, useRevalidator } from "react-router";
import { z } from "zod";

import { AutocompleteField } from "~/components/form/autocomplete-field";
import { FieldErrorText } from "~/components/form/field-error-text";
import { MasterSelectField } from "~/components/form/master-select-field";
import {
  type BillingContactInput,
  type BillingContactOptionFragment,
  getSdk,
  type StudentFormInitialFragment,
} from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { useMasterPrefectures } from "~/hooks/useMasterData";
import { usePostalCodeAutofill } from "~/hooks/usePostalCodeAutofill";
import {
  type StudentBillingContactForm,
  studentBillingContactFormSchema,
} from "~/routes/_core+/students+/_index/student-form-schema";
import type { StudentDetailContext } from "~/routes/_core+/students+/$studentId/route";
import { getGraphQLClient } from "~/services/graphql-client";

const billingContactOperationSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("save"),
    billingContact: studentBillingContactFormSchema.shape.billingContact,
  }),
  z.object({
    operation: z.literal("link"),
    billingContactId: z.string().min(1),
  }),
]);

type BillingContactOperation = z.infer<typeof billingContactOperationSchema>;
type StudentBillingContact = NonNullable<
  NonNullable<StudentFormInitialFragment["billingContacts"]>[number]
>;

// 生徒に対して表示・編集する請求先を1件に絞る。
function selectBillingContact(
  billingContacts: StudentFormInitialFragment["billingContacts"],
): StudentBillingContact | null {
  const validBillingContacts = (billingContacts ?? []).filter(
    (billingContact): billingContact is StudentBillingContact => Boolean(billingContact?.id),
  );
  return (
    validBillingContacts.find((billingContact) => billingContact.primary) ??
    validBillingContacts[0] ??
    null
  );
}

// 請求情報タブの保存操作を実行する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const studentId = params.studentId;
  if (!studentId) {
    throw new Response("studentId is required", { status: 400 });
  }

  const payload = billingContactOperationSchema.parse(await request.json());
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  if (payload.operation === "link") {
    const { linkStudentBillingContact } = await sdk.linkStudentBillingContact({
      studentId,
      billingContactId: payload.billingContactId,
    });
    return {
      message: linkStudentBillingContact ? "ok" : "ng",
      billingContact: linkStudentBillingContact ?? undefined,
      notify: linkStudentBillingContact
        ? { type: "success" as const, message: "既存の請求先を紐付けました" }
        : { type: "error" as const, message: "紐付けに失敗しました" },
    };
  }

  const { saveStudentBillingContact } = await sdk.saveStudentBillingContact({
    studentId,
    input: toBillingContactInput(payload.billingContact),
  });

  return {
    message: saveStudentBillingContact ? "ok" : "ng",
    billingContact: saveStudentBillingContact ?? undefined,
    notify: saveStudentBillingContact
      ? { type: "success" as const, message: "請求先情報を保存しました" }
      : { type: "error" as const, message: "保存に失敗しました" },
  };
};

type StudentBillingContactActionData = Awaited<ReturnType<typeof clientAction>>;

// 生徒詳細の請求情報タブ。
export default function StudentBillingContactsRoute() {
  const { student } = useOutletContext<StudentDetailContext>();
  const billingContact = selectBillingContact(student.billingContacts ?? []);
  const [isBillingContactOpen, setBillingContactOpen] = useState(false);
  const [isLinkBillingContactOpen, setLinkBillingContactOpen] = useState(false);

  // この生徒の請求先登録・編集モーダルを開く。
  const openBillingContactModal = () => {
    setBillingContactOpen(true);
  };

  // 既存請求先を選択するモーダルを開く。
  const openLinkBillingContactModal = () => {
    setLinkBillingContactOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-surface">
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">請求情報</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                生徒に紐づく請求先を確認・編集します。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {billingContact ? (
                <Button variant="outline" onPress={openLinkBillingContactModal}>
                  <CreditCard className="size-4" />
                  別の請求先に変更
                </Button>
              ) : null}
              <Button className="app-primary-button" onPress={openBillingContactModal}>
                <PencilLine className="size-4" />
                {billingContact ? "編集" : "新規登録"}
              </Button>
            </div>
          </div>

          {billingContact ? (
            <BillingContactPanel billingContact={billingContact} />
          ) : (
            <div className="space-y-4 rounded-lg border border-dashed border-border/70 p-8 text-center">
              <p className="text-muted-foreground text-sm">請求先情報はまだ登録されていません</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" onPress={openLinkBillingContactModal}>
                  <CreditCard className="size-4" />
                  既存請求先を選択
                </Button>
                <Button className="app-primary-button" onPress={openBillingContactModal}>
                  <PencilLine className="size-4" />
                  新規登録
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <BillingContactEditModal
        student={student}
        billingContact={billingContact}
        isOpen={isBillingContactOpen}
        onOpenChange={setBillingContactOpen}
      />
      <BillingContactLinkModal
        student={student}
        currentBillingContactId={billingContact?.id ?? null}
        isOpen={isLinkBillingContactOpen}
        onOpenChange={setLinkBillingContactOpen}
      />
    </div>
  );
}

// フォーム値を GraphQL の BillingContactInput へ変換する。
function toBillingContactInput(
  billingContact: StudentBillingContactForm["billingContact"],
): BillingContactInput {
  return {
    id: billingContact.id || undefined,
    name: billingContact.name,
    kana: billingContact.kana,
    prefectureCode: billingContact.prefectureCode,
    phone: billingContact.phone,
    email: billingContact.email,
    postalCode: billingContact.postalCode,
    address: billingContact.address,
    note: billingContact.note || undefined,
  };
}

interface BillingContactPanelProps {
  billingContact: StudentBillingContact;
}

// この生徒に紐づく請求先1件分の情報を表示する。
function BillingContactPanel({ billingContact }: BillingContactPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-default-50 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{billingContact.name ?? "-"}</h3>
        <p className="text-muted-foreground text-xs">{billingContact.kana ?? "-"}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DetailItem label="電話番号" value={billingContact.phone} />
        <DetailItem label="メールアドレス" value={billingContact.email} />
        <DetailItem label="郵便番号" value={billingContact.postalCode} />
        <DetailItem label="都道府県" value={billingContact.prefectureCode} />
        <DetailItem label="住所" value={billingContact.address} className="md:col-span-2" />
        <DetailItem label="メモ" value={billingContact.note} className="md:col-span-2" />
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

interface BillingContactEditModalProps {
  student: StudentFormInitialFragment;
  billingContact: StudentBillingContact | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 請求先の追加・編集を行うモーダル。
function BillingContactEditModal({
  student,
  billingContact,
  isOpen,
  onOpenChange,
}: BillingContactEditModalProps) {
  const form = useForm<StudentBillingContactForm>({
    resolver: zodResolver(studentBillingContactFormSchema),
    mode: "onSubmit",
    defaultValues: toBillingContactForm(billingContact),
  });
  const revalidator = useRevalidator();
  const mutation = useActionFetcher<StudentBillingContactActionData>({
    defaultAction: ({ studentId }: { studentId: string }) =>
      `/students/${studentId}/billing-contacts`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      revalidator.revalidate();
      onOpenChange(false);
    },
  });

  // モーダルを開くたびに、現在表示中の請求先情報へ戻す。
  useEffect(() => {
    if (!isOpen) return;
    form.reset(toBillingContactForm(billingContact));
  }, [billingContact, form, isOpen]);

  const onValid: SubmitHandler<StudentBillingContactForm> = (data) => {
    if (!student.id) return;
    mutation.submit(
      { operation: "save", billingContact: data.billingContact } satisfies BillingContactOperation,
      [{ studentId: student.id }],
    );
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container className="max-w-6xl" size="cover">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <CreditCard className="size-5 text-gray-700" />
              </span>
              <span>{billingContact ? "請求先情報を編集" : "請求先情報を登録"}</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <BillingContactFormFields form={form} />
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
              {billingContact ? "更新" : "登録"}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

// 請求先の取得結果をフォームへ詰め替える。
function toBillingContactForm(
  billingContact: StudentBillingContact | null,
): StudentBillingContactForm {
  return {
    billingContact: {
      id: billingContact?.id ?? "",
      name: billingContact?.name ?? "",
      kana: billingContact?.kana ?? "",
      prefectureCode: billingContact?.prefectureCode ?? "",
      phone: billingContact?.phone ?? "",
      email: billingContact?.email ?? "",
      postalCode: billingContact?.postalCode ?? "",
      address: billingContact?.address ?? "",
      note: billingContact?.note ?? "",
    },
  };
}

interface BillingContactLinkModalProps {
  student: StudentFormInitialFragment;
  currentBillingContactId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 既存の請求先を検索して、この生徒へ紐付けるモーダル。
function BillingContactLinkModal({
  student,
  currentBillingContactId,
  isOpen,
  onOpenChange,
}: BillingContactLinkModalProps) {
  const { contains } = useFilter({ sensitivity: "base" });
  const [selectedBillingContactId, setSelectedBillingContactId] = useState("");
  const [searchText, setSearchText] = useState("");
  const { data: billingContactOptions, loading, error } = useBillingContactOptions(searchText);
  const revalidator = useRevalidator();
  const mutation = useActionFetcher<StudentBillingContactActionData>({
    defaultAction: ({ studentId }: { studentId: string }) =>
      `/students/${studentId}/billing-contacts`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      revalidator.revalidate();
      onOpenChange(false);
    },
  });
  const selectedBillingContact = billingContactOptions.find(
    (billingContact) => billingContact.id === selectedBillingContactId,
  );

  // モーダルを開くたびに、候補選択状態を初期化する。
  useEffect(() => {
    if (!isOpen) return;
    setSelectedBillingContactId("");
    setSearchText("");
  }, [isOpen]);

  // 選択した既存請求先をこの生徒の請求先として紐付ける。
  const linkBillingContact = () => {
    if (!student.id || !selectedBillingContactId) return;
    mutation.submit(
      {
        operation: "link",
        billingContactId: selectedBillingContactId,
      } satisfies BillingContactOperation,
      [{ studentId: student.id }],
    );
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container className="max-w-3xl">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <CreditCard className="size-5 text-gray-700" />
              </span>
              <span>既存請求先を選択</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <AutocompleteField
                ariaLabel="既存請求先"
                emptyState={
                  loading
                    ? "請求先を検索中..."
                    : error
                      ? "請求先の取得に失敗しました"
                      : "該当する請求先がありません"
                }
                filter={contains}
                items={billingContactOptions
                  .filter((billingContact) => billingContact.id !== currentBillingContactId)
                  .map((billingContact) => ({
                    id: billingContact.id ?? "",
                    textValue: `${billingContact.name ?? ""} ${billingContact.kana ?? ""}`,
                    content: <BillingContactOptionItem billingContact={billingContact} />,
                  }))}
                label="請求先"
                onChange={setSelectedBillingContactId}
                onSearchValueChange={setSearchText}
                searchPlaceholder="請求先名・電話番号・メールで検索"
                searchValue={searchText}
                selectedValue={
                  selectedBillingContact ? (
                    <span>{selectedBillingContact.name ?? ""}</span>
                  ) : undefined
                }
                value={selectedBillingContactId || null}
              />
              <p className="text-muted-foreground text-xs">
                共有されている請求先を編集すると、同じ請求先を使う他の生徒にも反映されます。
              </p>
            </div>
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
              isDisabled={!selectedBillingContactId}
              isPending={mutation.submitting}
              onPress={linkBillingContact}
            >
              紐付け
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

interface BillingContactOptionItemProps {
  billingContact: BillingContactOptionFragment;
}

// 請求先候補の表示内容を整える。
function BillingContactOptionItem({ billingContact }: BillingContactOptionItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium">{billingContact.name ?? "-"}</span>
      <span className="text-muted-foreground text-xs">
        {[billingContact.phone, billingContact.email, billingContact.address]
          .filter(Boolean)
          .join(" / ") || "-"}
      </span>
    </div>
  );
}

interface UseBillingContactOptionsState {
  data: BillingContactOptionFragment[];
  loading: boolean;
  error: unknown;
}

// 請求先候補を GraphQL から検索して返す。
function useBillingContactOptions(searchText: string): UseBillingContactOptionsState {
  const [state, setState] = useState<UseBillingContactOptionsState>({
    data: [],
    loading: true,
    error: undefined,
  });

  // 入力文字列に応じて請求先候補を再取得する。
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const sdk = getSdk(getGraphQLClient());
          const trimmed = searchText.trim();
          const result = await sdk.billingContactOptions({ searchText: trimmed || undefined });
          const billingContacts = (result.billingContactOptions ?? []).filter(
            (billingContact): billingContact is BillingContactOptionFragment =>
              Boolean(billingContact?.id),
          );
          if (active) {
            setState({ data: billingContacts, loading: false, error: undefined });
          }
        } catch (error) {
          if (active) {
            setState({ data: [], loading: false, error });
          }
        }
      })();
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchText]);

  return state;
}

interface BillingContactFormFieldsProps {
  form: ReturnType<typeof useForm<StudentBillingContactForm>>;
}

// 請求先フォームの入力欄を描画する。
function BillingContactFormFields({ form }: BillingContactFormFieldsProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const { data: prefectures } = useMasterPrefectures();
  const postalCode = watch("billingContact.postalCode");
  const gridClassName = "grid grid-cols-1 gap-4 md:grid-cols-2";
  const wideFieldClassName = "space-y-1 md:col-span-2";
  const sectionClassName =
    "grid gap-3 border-separator/60 border-t pt-3 first:border-t-0 first:pt-0 lg:grid-cols-[7rem_1fr]";
  const sectionTitleClassName = "text-muted-foreground pt-1 text-xs font-semibold";

  // 郵便番号から都道府県と住所を補完する。
  usePostalCodeAutofill({
    zipCode: postalCode ?? "",
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
    <div className="space-y-3 rounded-medium border border-separator/60 bg-surface/30 p-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">請求先情報</h3>
        <p className="text-muted-foreground text-xs">請求書や決済連絡に使う宛先を入力します。</p>
      </div>

      <div className="space-y-3">
        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>基本情報</h3>
          <div className={gridClassName}>
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
              <Label className="block" isRequired>
                フリガナ
              </Label>
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

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>連絡先</h3>
          <div className={gridClassName}>
            <div className="space-y-1">
              <Label className="block" isRequired>
                電話番号
              </Label>
              <Input
                aria-label="電話番号"
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
                aria-label="メールアドレス"
                className="w-full"
                placeholder="例) billing@example.com"
                type="email"
                {...register("billingContact.email")}
              />
              <FieldErrorText message={errors.billingContact?.email?.message} />
            </div>
          </div>
        </section>

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>住所</h3>
          <div className={gridClassName}>
            <div className="space-y-1">
              <Label className="block" isRequired>
                郵便番号
              </Label>
              <Input
                aria-label="郵便番号"
                className="w-full"
                placeholder="例) 123-4567"
                {...register("billingContact.postalCode")}
              />
              <FieldErrorText message={errors.billingContact?.postalCode?.message} />
            </div>

            <MasterSelectField
              ariaLabel="請求先の都道府県"
              emptyState="該当する都道府県がありません"
              form={form}
              label="都道府県"
              name="billingContact.prefectureCode"
              useOptions={useMasterPrefectures}
            />

            <div className={wideFieldClassName}>
              <Label className="block" isRequired>
                住所
              </Label>
              <Input
                aria-label="住所"
                className="w-full"
                placeholder="例) 名古屋市中区..."
                {...register("billingContact.address")}
              />
              <FieldErrorText message={errors.billingContact?.address?.message} />
            </div>
          </div>
        </section>

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>補足</h3>
          <div className={gridClassName}>
            <div className={wideFieldClassName}>
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
      </div>
    </div>
  );
}
