import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { CreditCard } from "lucide-react";
import { useEffect } from "react";
import { useRevalidator } from "react-router";

import { useActionFetcher } from "~/hooks/useActionFetcher";
import { MembershipPlanFormFields } from "~/routes/_core+/membership-plans+/_index/components/membership-plan-form-fields";
import {
  emptyMembershipPlanForm,
  type MembershipPlanForm,
  membershipPlanFormSchema,
  toMembershipPlanInput,
} from "~/routes/_core+/membership-plans+/_index/membership-plan-form-schema";
import type { clientAction as CreatePlanAction } from "~/routes/_core+/membership-plans+/create/route";

type CreatePlanActionData = Awaited<ReturnType<typeof CreatePlanAction>>;

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 月額プラン作成モーダル。フォームと保存処理を内包する。
export function MembershipPlanCreateModal({ isOpen, onOpenChange }: Props) {
  const form = useForm<MembershipPlanForm>({
    mode: "uncontrolled",
    initialValues: emptyMembershipPlanForm,
    validate: schemaResolver(membershipPlanFormSchema, { sync: true }),
  });

  // オープン時は初期値を反映する。
  useEffect(() => {
    if (isOpen) form.setValues(emptyMembershipPlanForm);
  }, [form.setValues, isOpen]);

  const revalidator = useRevalidator();
  const createMutation = useActionFetcher<CreatePlanActionData>({
    defaultAction: "/membership-plans/create",
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      revalidator.revalidate();
      onOpenChange(false);
    },
  });

  const handleSubmit = form.onSubmit((data) => {
    createMutation.submit(toMembershipPlanInput(data));
  });

  return (
    <Modal
      centered
      opened={isOpen}
      size="lg"
      title={
        <Group gap="sm">
          <ThemeIcon color="brand" radius="sm" variant="light">
            <CreditCard size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            プランを作成
          </Title>
        </Group>
      }
      onClose={() => onOpenChange(false)}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            会員が契約する月額プラン（コース）を登録します。
          </Text>
          <MembershipPlanFormFields form={form} />
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
