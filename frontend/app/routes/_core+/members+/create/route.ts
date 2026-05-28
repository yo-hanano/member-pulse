import type { ActionFunctionArgs } from "react-router";

import { getSdk, type MemberInput } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 会員作成アクションを実行する。
export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = (await request.json()) as MemberInput;
  const { createMember } = await sdk.createMember({ input });

  return {
    message: createMember ? "ok" : "ng",
    member: createMember ?? undefined,
    notify: createMember
      ? { type: "success" as const, message: "会員を登録しました" }
      : { type: "error" as const, message: "新規登録に失敗しました" },
  };
};
