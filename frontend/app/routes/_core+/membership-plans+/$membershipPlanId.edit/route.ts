import type { ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 月額プラン更新を実行するアクション。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const membershipPlanId = params.membershipPlanId;
  if (!membershipPlanId) {
    throw new Response("membershipPlanId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = await request.json();
  const { updateMembershipPlan } = await sdk.updateMembershipPlan({ membershipPlanId, input });

  return {
    message: updateMembershipPlan ? "ok" : "ng",
    membershipPlan: updateMembershipPlan ?? undefined,
    notify: updateMembershipPlan
      ? { type: "success" as const, message: "プランを更新しました" }
      : { type: "error" as const, message: "更新に失敗しました" },
  };
};
