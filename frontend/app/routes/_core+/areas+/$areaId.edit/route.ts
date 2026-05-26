import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 編集モーダル表示用にエリア詳細を取得する
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const areaId = String(params.areaId);
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { areaById } = await sdk.areaById({ areaId });
  if (!areaById) {
    throw new Response(null, { status: 404 });
  }
  return { area: areaById };
};

// エリア更新を実行するアクション
export const clientAction = async ({ request, params }: ActionFunctionArgs) => {
  const areaId = String(params.areaId);
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = await request.json();
  const { updateArea } = await sdk.updateArea({ areaId, input });

  return {
    message: updateArea ? "ok" : "ng",
    area: updateArea ?? undefined,
    notify: updateArea
      ? { type: "success" as const, message: "エリアを更新しました" }
      : { type: "error" as const, message: "更新に失敗しました" },
  };
};
