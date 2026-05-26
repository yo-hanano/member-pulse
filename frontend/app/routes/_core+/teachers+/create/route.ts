import { type ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 講師作成アクションを実行する。
export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = await request.json();
  const normalizedInput = {
    ...input,
    birthday: input?.birthday ? input.birthday : null,
  };
  const { createTeacher } = await sdk.createTeacher({ input: normalizedInput });

  return {
    message: createTeacher ? "ok" : "ng",
    teacher: createTeacher ?? undefined,
    notify: createTeacher
      ? { type: "success" as const, message: "講師を登録しました" }
      : { type: "error" as const, message: "新規登録に失敗しました" },
  };
};
