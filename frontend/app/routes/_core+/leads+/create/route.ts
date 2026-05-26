import { type ActionFunctionArgs } from "react-router";

import { getSdk, type LeadInput } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// リード作成アクションを実行する。
export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = (await request.json()) as LeadInput;
  const { createLead } = await sdk.createLead({ input });

  return {
    message: createLead ? "ok" : "ng",
    lead: createLead ?? undefined,
    notify: createLead
      ? { type: "success" as const, message: "リードを登録しました" }
      : { type: "error" as const, message: "新規登録に失敗しました" },
  };
};
