import type { ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 月額プラン削除（論理削除）を実行するアクション。
export const clientAction = async ({ params }: ActionFunctionArgs) => {
  const membershipPlanId = params.membershipPlanId;
  if (!membershipPlanId) {
    throw new Response("membershipPlanId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { deleteMembershipPlan } = await sdk.deleteMembershipPlan({ membershipPlanId });

  return {
    message: deleteMembershipPlan ? "ok" : "ng",
    notify: deleteMembershipPlan
      ? { type: "success" as const, message: "プランを削除しました" }
      : { type: "error" as const, message: "削除に失敗しました" },
  };
};
