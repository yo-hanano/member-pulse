import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { schemaResolver, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { z } from "zod";

import type { MembershipSubscriptionItemFragment } from "~/generated/graphql";
import type { useActionFetcher } from "~/hooks/useActionFetcher";
import { formatDateYmd } from "~/lib/date";
import type { SubscriptionActionData } from "~/routes/_core+/members+/$memberId/subscriptions/route";

// 契約終了の入力値。コースの切れ目は月単位のため、終了日は月末に揃える。
const endFormSchema = z.object({
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "終了月を選択してください" }),
});

type EndForm = z.infer<typeof endFormSchema>;

// 月選択の値（YYYY-MM-DD）から、その月の月末日（YYYY-MM-末日）の文字列を返す。
function toMonthEnd(value: string | null): string {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  // new Date(year, month, 0) は当月（1始まり month）の末日を表す。
  const last = new Date(year, month, 0);
  const mm = String(last.getMonth() + 1).padStart(2, "0");
  const dd = String(last.getDate()).padStart(2, "0");
  return `${last.getFullYear()}-${mm}-${dd}`;
}

// 月選択の値（YYYY-MM-DD）を、その月の月初日（YYYY-MM-01）へ正規化する。
function toMonthStart(value: string | null): string {
  if (!value) return "";
  return `${value.slice(0, 7)}-01`;
}

// 今月の月初日（YYYY-MM-01）を返す。契約終了は今月末を既定にする。
function thisMonthStart(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}-01`;
}

interface Props {
  memberId: string | null;
  subscription: MembershipSubscriptionItemFragment | null;
  mutation: ReturnType<typeof useActionFetcher<SubscriptionActionData>>;
  opened: boolean;
  onClose: () => void;
}

// 契約終了の確認と終了月入力を行うモーダル。
export function SubscriptionEndModal({ memberId, subscription, mutation, opened, onClose }: Props) {
  const form = useForm<EndForm>({
    mode: "uncontrolled",
    initialValues: { endDate: toMonthEnd(thisMonthStart()) },
    validate: schemaResolver(endFormSchema, { sync: true }),
  });

  // 月選択は表示のため制御コンポーネントにする。フォームの endDate（月末）と同期する。
  const [endMonth, setEndMonth] = useState<string | null>(thisMonthStart());

  // モーダルを開くたびに終了月を今月へ戻す。
  useEffect(() => {
    if (!opened) return;
    const month = thisMonthStart();
    form.setValues({ endDate: toMonthEnd(month) });
    form.resetDirty();
    setEndMonth(month);
  }, [form.setValues, form.resetDirty, opened]);

  // 月選択を変更したら、その月の月末日をフォームの終了日へ反映する。
  const handleEndMonthChange = (value: string | null) => {
    setEndMonth(value ? toMonthStart(value) : null);
    form.setFieldValue("endDate", toMonthEnd(value));
  };

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
            {`${subscription?.membershipPlan?.name ?? "プラン未設定"}の契約を終了します。終了月は契約開始日（${formatDateYmd(subscription?.startDate)}）以降を指定してください。選んだ月の月末で終了します。会員の退会処理は概要タブの基本情報から別途行います。`}
          </Text>
          <MonthPickerInput
            description="コースの切れ目は月単位です。選んだ月の月末終了になります"
            error={form.errors.endDate}
            label="終了月"
            placeholder="月を選択"
            value={endMonth}
            valueFormat="YYYY年MM月"
            withAsterisk
            onChange={handleEndMonthChange}
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
