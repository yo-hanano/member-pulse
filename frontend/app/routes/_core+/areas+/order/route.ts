import type { ActionFunctionArgs } from "react-router";
import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// エリア並び順を一括更新するアクション
export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const inputs = await request.json();
  const { updateAreaOrders } = await sdk.updateAreaOrders({ inputs });

  return {
    message: updateAreaOrders ? "ok" : "ng",
    notify: updateAreaOrders
      ? { type: "success" as const, message: "並び順を更新しました" }
      : { type: "error" as const, message: "並び順の更新に失敗しました" },
  };
};
