import type { ActionFunctionArgs } from "react-router";
import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// エリア作成を実行するアクション
export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = await request.json();
  const { createArea } = await sdk.createArea({ input });

  return {
    message: createArea ? "ok" : "ng",
    area: createArea ?? undefined,
    notify: createArea
      ? { type: "success" as const, message: "エリアを登録しました" }
      : { type: "error" as const, message: "新規登録に失敗しました" },
  };
};
