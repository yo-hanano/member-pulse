import { Alert, Button, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { ArrowLeft, CircleCheck, UserRound } from "lucide-react";
import { useEffect } from "react";
import {
  type ActionFunctionArgs,
  useNavigate,
  useOutletContext,
  useRevalidator,
} from "react-router";

import { getSdk, type MemberInput } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { LeadDetailContext } from "~/routes/_core+/leads+/$leadId/route";
import { MemberFormFields } from "~/routes/_core+/members+/_index/components/member-form-fields";
import {
  type MemberForm,
  memberFormSchema,
  toMemberInput,
} from "~/routes/_core+/members+/_index/member-form-schema";
import { getGraphQLClient } from "~/services/graphql-client";

// 成約済みリードを会員へ変換する action。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = (await request.json()) as MemberInput;
  const { enrollLead } = await sdk.enrollLead({ leadId, input });

  return {
    message: enrollLead ? "ok" : "ng",
    member: enrollLead ?? undefined,
    notify: enrollLead
      ? { type: "success" as const, message: "入会処理が完了しました" }
      : { type: "error" as const, message: "入会処理に失敗しました" },
  };
};

type EnrollmentActionData = Awaited<ReturnType<typeof clientAction>>;

// リード詳細配下の入会処理タブ。
export default function LeadEnrollmentRoute() {
  const { lead } = useOutletContext<LeadDetailContext>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const canEnroll = lead.status === "contracted";
  const form = useForm<MemberForm>({
    mode: "uncontrolled",
    initialValues: buildEnrollmentInitialValues(lead),
    validate: schemaResolver(memberFormSchema, { sync: true }),
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
    form.setValues(buildEnrollmentInitialValues(lead));
  }, [form.setValues, lead]);

  const handleSubmit = form.onSubmit((data) => {
    if (!lead.id || !canEnroll) return;
    mutation.submit(toMemberInput(data), [{ leadId: lead.id }]);
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
                  成約リードの情報を引き継いで会員を作成します。
                </Text>
              </Stack>
            </Group>
            <MemberFormFields form={form} />
            <Group justify="flex-end">
              <Button
                leftSection={<CircleCheck size={16} />}
                loading={mutation.submitting}
                type="submit"
              >
                入会を確定
              </Button>
            </Group>
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
    address: "",
    birthDate: "",
    source: lead.source ?? "",
    note: lead.note ?? "",
  };
}
