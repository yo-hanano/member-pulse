import type { ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 月額プラン作成を実行するアクション。
export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = await request.json();
  const { createMembershipPlan } = await sdk.createMembershipPlan({ input });

  return {
    message: createMembershipPlan ? "ok" : "ng",
    membershipPlan: createMembershipPlan ?? undefined,
    notify: createMembershipPlan
      ? { type: "success" as const, message: "プランを登録しました" }
      : { type: "error" as const, message: "新規登録に失敗しました" },
  };
};
