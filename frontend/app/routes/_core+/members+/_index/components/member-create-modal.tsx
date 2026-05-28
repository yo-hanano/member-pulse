import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { UserRound } from "lucide-react";
import { useEffect } from "react";
import { useRevalidator } from "react-router";

import { modalSizes } from "~/lib/modal-sizes";
import { MemberFormFields } from "~/routes/_core+/members+/_index/components/member-form-fields";
import { useMemberCreate } from "~/routes/_core+/members+/_index/hooks/useMemberCreate";
import {
  emptyMemberForm,
  type MemberForm,
  memberFormSchema,
  toMemberInput,
} from "~/routes/_core+/members+/_index/member-form-schema";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 会員作成モーダル。フォーム、保存処理、再読込を内包する。
export function MemberCreateModal({ isOpen, onOpenChange }: Props) {
  const form = useForm<MemberForm>({
    mode: "uncontrolled",
    initialValues: emptyMemberForm,
    validate: schemaResolver(memberFormSchema, { sync: true }),
  });

  // オープン時は初期値を反映する。
  useEffect(() => {
    if (isOpen) form.setValues(emptyMemberForm);
  }, [form.setValues, isOpen]);

  const revalidator = useRevalidator();
  const createMutation = useMemberCreate(() => {
    revalidator.revalidate();
    form.setValues(emptyMemberForm);
    onOpenChange(false);
  });

  const handleSubmit = form.onSubmit((data) => {
    createMutation.submit(toMemberInput(data));
  });

  return (
    <Modal
      centered
      opened={isOpen}
      size={modalSizes.cover}
      title={
        <Group gap="sm">
          <ThemeIcon color="brand" radius="sm" variant="light">
            <UserRound size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            会員を作成
          </Title>
        </Group>
      }
      onClose={() => {
        onOpenChange(false);
        form.setValues(emptyMemberForm);
      }}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            必要な情報を入力して作成します。完了したら保存をクリックしてください。
          </Text>
          <MemberFormFields form={form} />
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
