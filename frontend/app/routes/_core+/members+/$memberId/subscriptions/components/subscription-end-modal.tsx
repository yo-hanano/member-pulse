import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { useEffect } from "react";
import { z } from "zod";

import type { MembershipSubscriptionItemFragment } from "~/generated/graphql";
import type { useActionFetcher } from "~/hooks/useActionFetcher";
import { formatDateYmd } from "~/lib/date";
import type { SubscriptionActionData } from "~/routes/_core+/members+/$memberId/subscriptions/route";

// 契約終了の入力値。終了日のみ指定する。
const endFormSchema = z.object({
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "終了日を入力してください" }),
});

type EndForm = z.infer<typeof endFormSchema>;

interface Props {
  memberId: string | null;
  subscription: MembershipSubscriptionItemFragment | null;
  mutation: ReturnType<typeof useActionFetcher<SubscriptionActionData>>;
  opened: boolean;
  onClose: () => void;
}

// 契約終了の確認と終了日入力を行うモーダル。
export function SubscriptionEndModal({ memberId, subscription, mutation, opened, onClose }: Props) {
  const form = useForm<EndForm>({
    mode: "uncontrolled",
    initialValues: { endDate: new Date().toISOString().slice(0, 10) },
    validate: schemaResolver(endFormSchema, { sync: true }),
  });

  // モーダルを開くたびに終了日を当日へ戻す。
  useEffect(() => {
    if (!opened) return;
    form.setValues({ endDate: new Date().toISOString().slice(0, 10) });
    form.resetDirty();
  }, [form.setValues, form.resetDirty, opened]);

  const handleSubmit = form.onSubmit((data) => {
    if (!memberId || !subscription?.id) return;
    mutation.submit(
      { intent: "end", membershipSubscriptionId: subscription.id, endDate: data.endDate },
      [{ memberId }],
    );
  });

  return (
    <Modal centered opened={opened} size="md" title="契約を終了" onClose={onClose}>
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm">
            {`${subscription?.membershipPlan?.name ?? "プラン未設定"}の契約を終了します。終了日は契約開始日（${formatDateYmd(subscription?.startDate)}）以降を指定してください。会員の退会処理は概要タブの基本情報から別途行います。`}
          </Text>
          <TextInput
            key={form.key("endDate")}
            {...form.getInputProps("endDate")}
            label="終了日"
            type="date"
            withAsterisk
          />
          <Group justify="flex-end">
            <Button disabled={mutation.submitting} variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button color="red" loading={mutation.submitting} type="submit">
              契約を終了
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
