import {
  Alert,
  Button,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { ArrowLeft, ArrowRight, CircleCheck, CreditCard, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type ActionFunctionArgs,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useRevalidator,
} from "react-router";
import { z } from "zod";

import { getSdk, type MemberInput, type MembershipSubscriptionInput } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { LeadDetailContext } from "~/routes/_core+/leads+/$leadId/route";
import { MemberFormFields } from "~/routes/_core+/members+/_index/components/member-form-fields";
import {
  type MemberForm,
  memberFormSchema,
  toMemberInput,
} from "~/routes/_core+/members+/_index/member-form-schema";
import { getGraphQLClient } from "~/services/graphql-client";

// コース選択肢として募集中の月額プランを取得する。
export const clientLoader = async () => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { activeMembershipPlans } = await sdk.activeMembershipPlans();
  return { plans: (activeMembershipPlans ?? []).filter((plan) => plan != null) };
};

type EnrollmentPayload = {
  input: MemberInput;
  subscription: MembershipSubscriptionInput;
};

// 成約済みリードを、会員＋コース契約へ同一トランザクションで変換する action。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { input, subscription } = (await request.json()) as EnrollmentPayload;
  const { enrollLead } = await sdk.enrollLead({ leadId, input, subscription });

  return {
    message: enrollLead ? "ok" : "ng",
    member: enrollLead ?? undefined,
    notify: enrollLead
      ? { type: "success" as const, message: "入会処理が完了しました" }
      : { type: "error" as const, message: "入会処理に失敗しました" },
  };
};

type EnrollmentActionData = Awaited<ReturnType<typeof clientAction>>;

// コース登録ステップの入力値。
const subscriptionFormSchema = z.object({
  membershipPlanId: z.string().min(1, { message: "コースを選択してください" }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "契約開始日を入力してください" }),
  monthlyFee: z.union([z.number().min(0), z.literal("")]),
  note: z.string().max(1000).optional().or(z.literal("")),
});

type SubscriptionForm = z.infer<typeof subscriptionFormSchema>;

// リード詳細配下の入会処理タブ。基本情報 → コース登録の2ステップで進める。
export default function LeadEnrollmentRoute() {
  const { lead } = useOutletContext<LeadDetailContext>();
  const { plans } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const canEnroll = lead.status === "contracted";
  const [step, setStep] = useState(0);

  const memberForm = useForm<MemberForm>({
    mode: "uncontrolled",
    initialValues: buildEnrollmentInitialValues(lead),
    validate: schemaResolver(memberFormSchema, { sync: true }),
  });

  const subscriptionForm = useForm<SubscriptionForm>({
    mode: "uncontrolled",
    initialValues: {
      membershipPlanId: "",
      startDate: new Date().toISOString().slice(0, 10),
      monthlyFee: "",
      note: "",
    },
    validate: schemaResolver(subscriptionFormSchema, { sync: true }),
  });

  const mutation = useActionFetcher<EnrollmentActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}/enrollment`,
    method: "post",
    encType: "application/json",
    onSuccess: (data) => {
      revalidator.revalidate();
      const memberId = data.member?.id;
      if (memberId) navigate(`/members/${memberId}`);
    },
  });

  // リードを読み直したときに、入会フォームの初期値も追従させる。
  useEffect(() => {
    memberForm.setValues(buildEnrollmentInitialValues(lead));
  }, [memberForm.setValues, lead]);

  // コース選択肢。拠点指定のあるプランはリードの拠点と一致するものだけに絞る。
  const planOptions = plans
    .filter((plan) => !plan.locationId || plan.locationId === lead.locationId)
    .map((plan) => ({
      value: String(plan.id),
      label: `${plan.name ?? "-"}（¥${(plan.monthlyFee ?? 0).toLocaleString()}/月）`,
    }));

  // 基本情報を検証してからコース登録ステップへ進む。
  const goToCourseStep = () => {
    if (memberForm.validate().hasErrors) return;
    setStep(1);
  };

  // プラン選択時に、そのプランの月額を初期値として反映する（手動調整は可能）。
  const handlePlanChange = (planId: string | null) => {
    subscriptionForm.setFieldValue("membershipPlanId", planId ?? "");
    const plan = plans.find((candidate) => String(candidate.id) === planId);
    if (plan?.monthlyFee != null) {
      subscriptionForm.setFieldValue("monthlyFee", plan.monthlyFee);
    }
  };

  // 両ステップの入力をまとめて1リクエストで送信する。
  const handleSubmit = subscriptionForm.onSubmit((subscriptionData) => {
    if (!lead.id || !canEnroll) return;
    if (memberForm.validate().hasErrors) {
      setStep(0);
      return;
    }
    mutation.submit(
      {
        input: toMemberInput(memberForm.getValues()),
        subscription: {
          membershipPlanId: subscriptionData.membershipPlanId,
          startDate: subscriptionData.startDate,
          monthlyFee: subscriptionData.monthlyFee === "" ? undefined : subscriptionData.monthlyFee,
          note: subscriptionData.note || undefined,
        },
      },
      [{ leadId: lead.id }],
    );
  });

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Button
          leftSection={<ArrowLeft size={16} />}
          variant="default"
          onClick={() => navigate("/leads")}
        >
          一覧へ戻る
        </Button>
      </Group>

      {!canEnroll ? (
        <Alert color="yellow" title="成約後に入会処理できます">
          <Text size="sm">リードの状態を成約にすると、入会処理を実行できます。</Text>
        </Alert>
      ) : (
        <form noValidate onSubmit={handleSubmit}>
          <Stack gap="md">
            <Group gap="sm">
              <ThemeIcon color="brand" radius="sm" variant="light">
                <UserRound size={18} />
              </ThemeIcon>
              <Stack gap={0}>
                <Title order={3} size="h4">
                  入会処理
                </Title>
                <Text c="dimmed" size="sm">
                  会員の基本情報を確認し、続けてコースを登録します。
                </Text>
              </Stack>
            </Group>

            <Stepper active={step} size="sm" onStepClick={setStep}>
              <Stepper.Step
                description="リードから引き継いだ情報を確認"
                icon={<UserRound size={18} />}
                label="基本情報"
              >
                <Stack gap="md" mt="md">
                  <MemberFormFields form={memberForm} variant="enrollment" />
                  <Group justify="flex-end">
                    <Button rightSection={<ArrowRight size={16} />} onClick={goToCourseStep}>
                      コース登録へ
                    </Button>
                  </Group>
                </Stack>
              </Stepper.Step>

              <Stepper.Step
                description="契約するコースと開始日"
                icon={<CreditCard size={18} />}
                label="コース登録"
              >
                <Stack gap="md" mt="md">
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Select
                      key={subscriptionForm.key("membershipPlanId")}
                      {...subscriptionForm.getInputProps("membershipPlanId")}
                      data={planOptions}
                      label="コース（月額プラン）"
                      placeholder={
                        planOptions.length === 0 ? "募集中のプランがありません" : "コースを選択"
                      }
                      searchable
                      withAsterisk
                      onChange={handlePlanChange}
                    />
                    <TextInput
                      key={subscriptionForm.key("startDate")}
                      {...subscriptionForm.getInputProps("startDate")}
                      label="契約開始日"
                      type="date"
                      withAsterisk
                    />
                    <NumberInput
                      key={subscriptionForm.key("monthlyFee")}
                      {...subscriptionForm.getInputProps("monthlyFee")}
                      description="プラン選択時に自動入力されます。割引などがあれば調整してください"
                      label="月額"
                      min={0}
                      prefix="¥"
                      thousandSeparator=","
                    />
                    <Textarea
                      key={subscriptionForm.key("note")}
                      {...subscriptionForm.getInputProps("note")}
                      className="md:col-span-2"
                      label="契約メモ"
                      minRows={2}
                      placeholder="例) キャンペーン適用、初月無料 など"
                    />
                  </SimpleGrid>
                  <Group justify="space-between">
                    <Button
                      leftSection={<ArrowLeft size={16} />}
                      variant="default"
                      onClick={() => setStep(0)}
                    >
                      基本情報へ戻る
                    </Button>
                    <Button
                      leftSection={<CircleCheck size={16} />}
                      loading={mutation.submitting}
                      type="submit"
                    >
                      入会を確定
                    </Button>
                  </Group>
                </Stack>
              </Stepper.Step>
            </Stepper>
          </Stack>
        </form>
      )}
    </Stack>
  );
}

function buildEnrollmentInitialValues(lead: LeadDetailContext["lead"]): MemberForm {
  return {
    locationId: lead.locationId ?? "",
    leadId: lead.id ?? "",
    name: lead.name ?? "",
    status: "active",
    joinedAt: new Date().toISOString().slice(0, 10),
    resignedAt: "",
    resignationReasonCode: "",
    resignationNote: "",
    phone: lead.phone ?? "",
    email: lead.email ?? "",
    lineDisplayName: "",
    zipCode: "",
    prefectureCode: "",
    address: "",
    birthDate: "",
    source: lead.source ?? "",
    note: lead.note ?? "",
  };
}
