import {
  Alert,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { useEffect } from "react";
import { z } from "zod";

import type {
  MembershipPlanOptionFragment,
  MembershipSubscriptionItemFragment,
} from "~/generated/graphql";
import type { useActionFetcher } from "~/hooks/useActionFetcher";
import { formatDateYmd } from "~/lib/date";
import type { MemberDetailContext } from "~/routes/_core+/members+/$memberId/route";
import type { SubscriptionActionData } from "~/routes/_core+/members+/$memberId/subscriptions/route";

// プラン変更（新規契約）の入力値。入会処理のコース登録ステップと同じ構成。
const planChangeFormSchema = z.object({
  membershipPlanId: z.string().min(1, { message: "コースを選択してください" }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "切替日を入力してください" }),
  monthlyFee: z.union([z.number().min(0), z.literal("")]),
  note: z.string().max(1000).optional().or(z.literal("")),
});

type PlanChangeForm = z.infer<typeof planChangeFormSchema>;

interface Props {
  member: MemberDetailContext["member"];
  /** アクティブ契約。null の場合は新規契約として開始する。 */
  current: MembershipSubscriptionItemFragment | null;
  plans: MembershipPlanOptionFragment[];
  mutation: ReturnType<typeof useActionFetcher<SubscriptionActionData>>;
  opened: boolean;
  onClose: () => void;
}

// プラン変更・新規契約のフォームを描画するモーダル。
export function SubscriptionPlanChangeModal({
  member,
  current,
  plans,
  mutation,
  opened,
  onClose,
}: Props) {
  const isChange = current != null;

  const form = useForm<PlanChangeForm>({
    mode: "uncontrolled",
    initialValues: buildInitialValues(),
    validate: schemaResolver(planChangeFormSchema, { sync: true }),
  });

  // モーダルを開くたびにフォームを初期値へ戻す。
  useEffect(() => {
    if (!opened) return;
    form.setValues(buildInitialValues());
    form.resetDirty();
  }, [form.setValues, form.resetDirty, opened]);

  // コース選択肢。拠点指定のあるプランは会員の拠点と一致するものだけに絞る。
  const planOptions = plans
    .filter((plan) => !plan.locationId || plan.locationId === member.locationId)
    .map((plan) => ({
      value: String(plan.id),
      label: `${plan.name ?? "-"}（¥${(plan.monthlyFee ?? 0).toLocaleString()}/月）`,
    }));

  // プラン選択時に、そのプランの月額を初期値として反映する（手動調整は可能）。
  const handlePlanChange = (planId: string | null) => {
    form.setFieldValue("membershipPlanId", planId ?? "");
    const plan = plans.find((candidate) => String(candidate.id) === planId);
    if (plan?.monthlyFee != null) {
      form.setFieldValue("monthlyFee", plan.monthlyFee);
    }
  };

  const handleSubmit = form.onSubmit((data) => {
    if (!member.id) return;
    mutation.submit(
      {
        intent: "changePlan",
        membershipPlanId: data.membershipPlanId,
        startDate: data.startDate,
        monthlyFee: data.monthlyFee === "" ? undefined : data.monthlyFee,
        note: data.note || undefined,
      },
      [{ memberId: member.id }],
    );
  });

  return (
    <Modal
      centered
      opened={opened}
      size="lg"
      title={isChange ? "プラン変更" : "新しい契約を開始"}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          {isChange ? (
            <Alert color="blue" title="現在の契約は切替日の前日で終了します">
              <Text size="sm">
                {`現契約（${current?.membershipPlan?.name ?? "プラン未設定"}）は切替日の前日まで有効です。切替日は現契約の開始日（${formatDateYmd(current?.startDate)}）より後の日付を指定してください。`}
              </Text>
            </Alert>
          ) : null}
          <Select
            key={form.key("membershipPlanId")}
            {...form.getInputProps("membershipPlanId")}
            data={planOptions}
            label="コース（月額プラン）"
            placeholder={planOptions.length === 0 ? "募集中のプランがありません" : "コースを選択"}
            searchable
            withAsterisk
            onChange={handlePlanChange}
          />
          <TextInput
            key={form.key("startDate")}
            {...form.getInputProps("startDate")}
            label={isChange ? "切替日（新契約の開始日）" : "契約開始日"}
            type="date"
            withAsterisk
          />
          <NumberInput
            key={form.key("monthlyFee")}
            {...form.getInputProps("monthlyFee")}
            description="プラン選択時に自動入力されます。割引などがあれば調整してください"
            label="月額"
            min={0}
            prefix="¥"
            thousandSeparator=","
          />
          <Textarea
            key={form.key("note")}
            {...form.getInputProps("note")}
            label="契約メモ"
            minRows={2}
            placeholder="例) キャンペーン適用、初月無料 など"
          />
          <Group justify="flex-end">
            <Button disabled={mutation.submitting} variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button loading={mutation.submitting} type="submit">
              {isChange ? "プランを変更" : "契約を開始"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function buildInitialValues(): PlanChangeForm {
  return {
    membershipPlanId: "",
    startDate: new Date().toISOString().slice(0, 10),
    monthlyFee: "",
    note: "",
  };
}
