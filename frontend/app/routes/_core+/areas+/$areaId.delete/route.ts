import type { ActionFunctionArgs } from "react-router";
import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// エリア削除を実行するアクション
export const clientAction = async ({ params }: ActionFunctionArgs) => {
  const areaId = String(params.areaId);
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { deleteArea } = await sdk.deleteArea({ areaId });

  return {
    message: deleteArea ? "ok" : "ng",
    notify: deleteArea
      ? { type: "success" as const, message: "エリアを削除しました" }
      : { type: "error" as const, message: "エリア削除に失敗しました" },
  };
};
