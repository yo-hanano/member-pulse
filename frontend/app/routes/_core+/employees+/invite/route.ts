import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

const InviteInputSchema = z.object({
  email: z
    .email({ message: "有効なメールアドレスを入力してください" })
    .trim()
    .min(1, "メールアドレスを入力してください"),
});

export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const inputs = await request.json();
  const validatedInputs = InviteInputSchema.parse(inputs);
  const { issueEmployeeInvite } = await sdk.issueEmployeeInvite({ input: validatedInputs });

  if (issueEmployeeInvite?.employeeId) {
    return {
      message: "ok",
      invite: issueEmployeeInvite,
      notify: { type: "success", message: "パスワード設定リンクを送信しました" },
    };
  }

  return {
    message: "ng",
    invite: undefined,
    notify: { type: "error", message: "パスワード設定リンク送信に失敗しました" },
  };
};
