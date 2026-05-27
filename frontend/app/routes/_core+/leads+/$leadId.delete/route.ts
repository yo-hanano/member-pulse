import type { ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// リード削除アクションを実行する。
export const clientAction = async ({ params }: ActionFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { deleteLead } = await sdk.deleteLead({ leadId });

  return {
    message: deleteLead ? "ok" : "ng",
    notify: deleteLead
      ? { type: "success" as const, message: "リードを削除しました" }
      : { type: "error" as const, message: "削除に失敗しました" },
  };
};
