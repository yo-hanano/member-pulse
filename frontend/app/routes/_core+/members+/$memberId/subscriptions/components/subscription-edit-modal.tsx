import { Button, Group, Modal, NumberInput, Stack, Textarea } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { useEffect } from "react";
import { z } from "zod";

import type { MembershipSubscriptionItemFragment } from "~/generated/graphql";
import type { useActionFetcher } from "~/hooks/useActionFetcher";
import type { SubscriptionActionData } from "~/routes/_core+/members+/$memberId/subscriptions/route";

// 契約修正の入力値。月額とメモのみ変更できる（プランや期間はプラン変更・終了で扱う）。
const editFormSchema = z.object({
  monthlyFee: z
    .union([z.number().min(0), z.literal("")])
    .refine((value) => value !== "", { message: "月額を入力してください" }),
  note: z.string().max(1000).optional().or(z.literal("")),
});

// NumberInput の未入力は "" になるため、フォーム型は明示的に union で持つ。
type EditForm = { monthlyFee: number | ""; note: string };

interface Props {
  memberId: string | null;
  /** 修正対象の契約。null のときはモーダルを閉じる。 */
  subscription: MembershipSubscriptionItemFragment | null;
  mutation: ReturnType<typeof useActionFetcher<SubscriptionActionData>>;
  onClose: () => void;
}

// 契約の月額・メモを修正するモーダル。
export function SubscriptionEditModal({ memberId, subscription, mutation, onClose }: Props) {
  const opened = subscription != null;

  const form = useForm<EditForm>({
    mode: "uncontrolled",
    initialValues: { monthlyFee: "", note: "" },
    validate: schemaResolver(editFormSchema, { sync: true }),
  });

  // モーダルを開くたびに、修正対象の契約の値へフォームを戻す。
  useEffect(() => {
    if (!opened) return;
    form.setValues({
      monthlyFee: subscription?.monthlyFee ?? "",
      note: subscription?.note ?? "",
    });
    form.resetDirty();
  }, [form.setValues, form.resetDirty, opened, subscription]);

  const handleSubmit = form.onSubmit((data) => {
    if (!memberId || !subscription?.id || data.monthlyFee === "") return;
    mutation.submit(
      {
        intent: "updateSubscription",
        membershipSubscriptionId: subscription.id,
        monthlyFee: data.monthlyFee,
        note: data.note || undefined,
      },
      [{ memberId }],
    );
  });

  return (
    <Modal centered opened={opened} size="md" title="契約を修正" onClose={onClose}>
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <NumberInput
            key={form.key("monthlyFee")}
            {...form.getInputProps("monthlyFee")}
            description="割引などの個別調整はこの契約だけに反映されます"
            label="月額"
            min={0}
            prefix="¥"
            thousandSeparator=","
            withAsterisk
          />
          <Textarea
            key={form.key("note")}
            {...form.getInputProps("note")}
            label="契約メモ"
            minRows={2}
          />
          <Group justify="flex-end">
            <Button disabled={mutation.submitting} variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button loading={mutation.submitting} type="submit">
              保存
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
