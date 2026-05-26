import { type ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 拠点作成アクションを実行する。
export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = await request.json();
  const { createBranch } = await sdk.createBranch({ input });

  return {
    message: createBranch ? "ok" : "ng",
    branch: createBranch ?? undefined,
    notify: createBranch
      ? { type: "success" as const, message: "拠点を登録しました" }
      : { type: "error" as const, message: "新規登録に失敗しました" },
  };
};
