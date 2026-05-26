import { type ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 生徒作成アクションを実行する。
export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = await request.json();
  const { createStudent } = await sdk.createStudent({ input });

  return {
    message: createStudent ? "ok" : "ng",
    student: createStudent ?? undefined,
    notify: createStudent
      ? { type: "success" as const, message: "生徒を登録しました" }
      : { type: "error" as const, message: "新規登録に失敗しました" },
  };
};
