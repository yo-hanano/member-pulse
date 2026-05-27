import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { getSdk, type LeadInput } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// リード編集画面で利用する詳細データを取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { leadById } = await sdk.leadById({ leadId });
  return { lead: leadById };
};

// リード更新アクションを実行する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const leadId = params.leadId;
  if (!leadId) {
    throw new Response("leadId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = (await request.json()) as LeadInput;
  const { updateLead } = await sdk.updateLead({ leadId, input });

  return {
    message: updateLead ? "ok" : "ng",
    lead: updateLead ?? undefined,
    notify: updateLead
      ? { type: "success" as const, message: "リードを更新しました" }
      : { type: "error" as const, message: "更新に失敗しました" },
  };
};
