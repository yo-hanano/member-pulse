import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { PencilLine } from "lucide-react";
import { useEffect } from "react";
import { useRevalidator } from "react-router";

import type { MembershipPlanItemFragment } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { MembershipPlanFormFields } from "~/routes/_core+/membership-plans+/_index/components/membership-plan-form-fields";
import {
  emptyMembershipPlanForm,
  type MembershipPlanForm,
  membershipPlanFormSchema,
  toMembershipPlanInput,
} from "~/routes/_core+/membership-plans+/_index/membership-plan-form-schema";
import type { clientAction as EditPlanAction } from "~/routes/_core+/membership-plans+/$membershipPlanId.edit/route";

type EditPlanActionData = Awaited<ReturnType<typeof EditPlanAction>>;

interface Props {
  /** 編集対象のプラン。null のときは閉じる。一覧の取得済みデータをそのまま使う。 */
  plan: MembershipPlanItemFragment | null;
  onClose: () => void;
}

// 月額プラン編集モーダル。フォームと更新処理を内包する。
export function MembershipPlanEditModal({ plan, onClose }: Props) {
  const form = useForm<MembershipPlanForm>({
    mode: "uncontrolled",
    initialValues: emptyMembershipPlanForm,
    validate: schemaResolver(membershipPlanFormSchema, { sync: true }),
  });

  // オープン時に編集対象の値を反映する。
  useEffect(() => {
    if (!plan) return;
    form.setValues({
      name: plan.name ?? "",
      monthlyFee: plan.monthlyFee ?? "",
      locationId: plan.locationId ?? "",
      active: plan.active ?? true,
      displayOrder: plan.displayOrder ?? "",
      note: plan.note ?? "",
    });
    form.resetDirty();
  }, [form.setValues, form.resetDirty, plan]);

  const revalidator = useRevalidator();
  const editMutation = useActionFetcher<EditPlanActionData>({
    defaultAction: ({ membershipPlanId }: { membershipPlanId: string }) =>
      `/membership-plans/${membershipPlanId}/edit`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      revalidator.revalidate();
      onClose();
    },
  });

  const handleSubmit = form.onSubmit((data) => {
    if (!plan?.id) return;
    editMutation.submit(toMembershipPlanInput(data), [{ membershipPlanId: String(plan.id) }]);
  });

  return (
    <Modal
      centered
      opened={plan != null}
      size="lg"
      title={
        <Group gap="sm">
          <ThemeIcon color="brand" radius="sm" variant="light">
            <PencilLine size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            プランを編集
          </Title>
        </Group>
      }
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            月額の変更は新規契約にのみ適用されます。既存契約の月額は契約側で管理します。
          </Text>
          <MembershipPlanFormFields form={form} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button loading={editMutation.submitting} type="submit">
              更新
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
