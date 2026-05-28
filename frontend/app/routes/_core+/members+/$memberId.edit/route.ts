import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { getSdk, type MemberInput } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 会員編集画面で利用する詳細データを取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const memberId = params.memberId;
  if (!memberId) {
    throw new Response("memberId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { memberById } = await sdk.memberById({ memberId });
  return { member: memberById };
};

// 会員更新アクションを実行する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const memberId = params.memberId;
  if (!memberId) {
    throw new Response("memberId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = (await request.json()) as MemberInput;
  const { updateMember } = await sdk.updateMember({ memberId, input });

  return {
    message: updateMember ? "ok" : "ng",
    member: updateMember ?? undefined,
    notify: updateMember
      ? { type: "success" as const, message: "会員を更新しました" }
      : { type: "error" as const, message: "更新に失敗しました" },
  };
};
