import { type ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 講師削除アクションを実行する。
export const clientAction = async ({ params }: ActionFunctionArgs) => {
  const teacherId = params.teacherId;
  if (!teacherId) {
    throw new Response("teacherId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { deleteTeacher } = await sdk.deleteTeacher({ teacherId });

  return {
    message: deleteTeacher ? "ok" : "ng",
    notify: deleteTeacher
      ? { type: "success" as const, message: "講師を削除しました" }
      : { type: "error" as const, message: "削除に失敗しました" },
  };
};
