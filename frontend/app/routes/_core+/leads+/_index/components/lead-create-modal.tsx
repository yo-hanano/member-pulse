import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { MessageSquare } from "lucide-react";
import { useEffect } from "react";
import { useRevalidator } from "react-router";

import { modalSizes } from "~/lib/modal-sizes";
import { LeadFormFields } from "~/routes/_core+/leads+/_index/components/lead-form-fields";
import { useLeadCreate } from "~/routes/_core+/leads+/_index/hooks/useLeadCreate";
import {
  emptyLeadForm,
  type LeadForm,
  leadFormSchema,
  toLeadInput,
} from "~/routes/_core+/leads+/_index/lead-form-schema";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// リード作成モーダル。フォーム、保存処理、再読込を内包する。
export function LeadCreateModal({ isOpen, onOpenChange }: Props) {
  const form = useForm<LeadForm>({
    mode: "uncontrolled",
    initialValues: emptyLeadForm,
    validate: schemaResolver(leadFormSchema, { sync: true }),
  });

  // オープン時は初期値を反映する。
  useEffect(() => {
    if (isOpen) form.setValues(emptyLeadForm);
  }, [form.setValues, isOpen]);

  const revalidator = useRevalidator();
  const createMutation = useLeadCreate(() => {
    revalidator.revalidate();
    form.setValues(emptyLeadForm);
    onOpenChange(false);
  });

  const handleSubmit = form.onSubmit((data) => {
    createMutation.submit(toLeadInput(data));
  });

  return (
    <Modal
      centered
      opened={isOpen}
      size={modalSizes.cover}
      title={
        <Group gap="sm">
          <ThemeIcon color="brand" radius="sm" variant="light">
            <MessageSquare size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            リードを作成
          </Title>
        </Group>
      }
      onClose={() => {
        onOpenChange(false);
        form.setValues(emptyLeadForm);
      }}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            必要な情報を入力して作成します。完了したら保存をクリックしてください。
          </Text>
          <LeadFormFields form={form} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button loading={createMutation.submitting} type="submit">
              保存
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
