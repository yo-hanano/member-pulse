import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 編集モーダル初期表示用に拠点詳細を取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const branchId = String(params.branchId);
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { branchById } = await sdk.branchById({ branchId });

  if (!branchById) {
    throw new Response(null, { status: 404 });
  }

  return { branch: branchById };
};

// 拠点更新アクションを実行する。
export const clientAction = async ({ request, params }: ActionFunctionArgs) => {
  const branchId = String(params.branchId);
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = await request.json();
  const { updateBranch } = await sdk.updateBranch({ branchId, input });

  return {
    message: updateBranch ? "ok" : "ng",
    branch: updateBranch ?? undefined,
    notify: updateBranch
      ? { type: "success" as const, message: "拠点を更新しました" }
      : { type: "error" as const, message: "更新に失敗しました" },
  };
};
