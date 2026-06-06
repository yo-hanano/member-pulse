import { Button, Group, Modal, Stack, Text, TextInput, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { Clock } from "lucide-react";
import { useEffect } from "react";
import { useRevalidator } from "react-router";
import { z } from "zod";

import { useActionFetcher } from "~/hooks/useActionFetcher";
import { toDateTimeLocalValue } from "~/lib/date";
import type {
  LeadDetailContext,
  clientAction as leadDetailAction,
} from "~/routes/_core+/leads+/$leadId/route";

const holdFormSchema = z.object({
  nextContactAt: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { message: "次回連絡日を入力してください" }),
});

type HoldForm = z.infer<typeof holdFormSchema>;
type LeadDetailActionData = Awaited<ReturnType<typeof leadDetailAction>>;

interface Props {
  lead: LeadDetailContext["lead"];
  opened: boolean;
  onClose: () => void;
  /** モーダルの見出し。用途（保留・不通・連絡日更新）に合わせて差し替える。 */
  title?: string;
  /** 入力前に示す説明文。 */
  description?: string;
  /** 保存時に遷移させる状態。省略時は現在の状態を維持する（純粋な連絡日更新）。 */
  targetStatus?: string;
}

// 既定の次回連絡日として1週間後を提案する。
const defaultNextContactAt = () =>
  toDateTimeLocalValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

// 次回連絡日を記録するモーダル。保留・不通など追客が必要な対応で共通利用する。
export function LeadHoldModal({
  lead,
  opened,
  onClose,
  title = "保留にする",
  description = "判断を保留し、次に連絡する日時を決めておきます。",
  targetStatus,
}: Props) {
  const revalidator = useRevalidator();
  const form = useForm<HoldForm>({
    mode: "uncontrolled",
    initialValues: { nextContactAt: defaultNextContactAt() },
    validate: schemaResolver(holdFormSchema, { sync: true }),
  });

  const mutation = useActionFetcher<LeadDetailActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      revalidator.revalidate();
      onClose();
    },
  });

  // モーダルを開くたびに、設定済みの次回連絡日（なければ1週間後）へ戻す。
  useEffect(() => {
    if (!opened) return;
    form.setValues({
      nextContactAt: toDateTimeLocalValue(lead.nextContactAt ?? "") || defaultNextContactAt(),
    });
    form.resetDirty();
  }, [form.setValues, form.resetDirty, opened, lead.nextContactAt]);

  // 指定があれば状態も遷移させ、なければ状態は維持したまま次回連絡日のみ更新する。
  const handleSubmit = form.onSubmit((data) => {
    const status = targetStatus ?? lead.status;
    if (!lead.id || !status) return;
    mutation.submit({ intent: "updateStatusNote", status, ...data }, [{ leadId: lead.id }]);
  });

  return (
    <Modal
      centered
      opened={opened}
      size="sm"
      title={
        <Group gap="sm">
          <ThemeIcon color="brand" radius="sm" variant="light">
            <Clock size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            {title}
          </Title>
        </Group>
      }
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm">{description}</Text>
          <TextInput
            key={form.key("nextContactAt")}
            {...form.getInputProps("nextContactAt")}
            label="次回連絡日"
            type="datetime-local"
            withAsterisk
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
