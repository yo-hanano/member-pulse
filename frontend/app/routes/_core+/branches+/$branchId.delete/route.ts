import { type ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 拠点削除アクションを実行する。
export const clientAction = async ({ params }: ActionFunctionArgs) => {
  const branchId = String(params.branchId);
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { deleteBranch } = await sdk.deleteBranch({ branchId });

  return {
    message: deleteBranch ? "ok" : "ng",
    notify: deleteBranch
      ? { type: "success" as const, message: "拠点を削除しました" }
      : { type: "error" as const, message: "拠点削除に失敗しました" },
  };
};
