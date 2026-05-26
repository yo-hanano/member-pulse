import { type ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 生徒削除アクションを実行する。
export const clientAction = async ({ params }: ActionFunctionArgs) => {
  const studentId = params.studentId;
  if (!studentId) {
    throw new Response("studentId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { deleteStudent } = await sdk.deleteStudent({ studentId });

  return {
    message: deleteStudent ? "ok" : "ng",
    notify: deleteStudent
      ? { type: "success" as const, message: "生徒を削除しました" }
      : { type: "error" as const, message: "削除に失敗しました" },
  };
};
