import type { ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 会員削除アクションを実行する。
export const clientAction = async ({ params }: ActionFunctionArgs) => {
  const memberId = params.memberId;
  if (!memberId) {
    throw new Response("memberId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { deleteMember } = await sdk.deleteMember({ memberId });

  return {
    message: deleteMember ? "ok" : "ng",
    notify: deleteMember
      ? { type: "success" as const, message: "会員を削除しました" }
      : { type: "error" as const, message: "削除に失敗しました" },
  };
};
