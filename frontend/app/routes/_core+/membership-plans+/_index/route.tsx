import { Anchor, Breadcrumbs, Button, Group, Stack, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useRevalidator } from "react-router";

import { getSdk, type MembershipPlanItemFragment } from "~/generated/graphql";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import { MembershipPlanCreateModal } from "~/routes/_core+/membership-plans+/_index/components/membership-plan-create-modal";
import { MembershipPlanDeleteDialog } from "~/routes/_core+/membership-plans+/_index/components/membership-plan-delete-dialog";
import { MembershipPlanEditModal } from "~/routes/_core+/membership-plans+/_index/components/membership-plan-edit-modal";
import { MembershipPlanListTable } from "~/routes/_core+/membership-plans+/_index/components/membership-plan-list-table";
import type { clientAction as DeletePlanAction } from "~/routes/_core+/membership-plans+/$membershipPlanId.delete/route";
import { getGraphQLClient } from "~/services/graphql-client";

type DeletePlanActionData = Awaited<ReturnType<typeof DeletePlanAction>>;

// 停止中も含む全プランを表示順で取得するローダー。
export const clientLoader = async () => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { allMembershipPlans } = await sdk.allMembershipPlans();
  return { plans: (allMembershipPlans ?? []).filter((plan) => plan != null) };
};

export function meta() {
  return [{ title: "会員プラン" }, { name: "description", content: "会員プラン管理" }];
}

// 月額プラン（コース）マスタの管理画面。
export default function MembershipPlansIndexRoute() {
  const { plans } = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<MembershipPlanItemFragment | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  const deleteMutation = useActionFetcher<DeletePlanActionData>({
    defaultAction: ({ membershipPlanId }: { membershipPlanId: string }) =>
      `/membership-plans/${membershipPlanId}/delete`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      setDeletePlanId(null);
      revalidator.revalidate();
    },
  });

  // 削除確認ダイアログから削除を実行する。
  const submitDelete = () => {
    if (!deletePlanId) return;
    deleteMutation.submit({}, [{ membershipPlanId: deletePlanId }]);
  };

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Breadcrumbs>
          <Anchor component={Link} c="dimmed" size="sm" to="/">
            ホーム
          </Anchor>
          <Text c="dimmed" size="sm">
            会員プラン
          </Text>
        </Breadcrumbs>

        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={2}>会員プラン</Title>
            <Text c="dimmed" size="sm">
              会員が契約する月額プラン（コース）を管理します。
            </Text>
          </Stack>
          <Button leftSection={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            プランを追加
          </Button>
        </Group>
      </Stack>

      <MembershipPlanListTable
        plans={plans}
        onDelete={(planId) => setDeletePlanId(planId)}
        onEdit={(plan) => setEditPlan(plan)}
      />

      <MembershipPlanCreateModal isOpen={isCreateOpen} onOpenChange={setCreateOpen} />
      <MembershipPlanEditModal plan={editPlan} onClose={() => setEditPlan(null)} />
      <MembershipPlanDeleteDialog
        isOpen={deletePlanId != null}
        isPending={deleteMutation.submitting}
        onConfirm={submitDelete}
        onOpenChange={(open) => {
          if (!open) setDeletePlanId(null);
        }}
      />
    </Stack>
  );
}
