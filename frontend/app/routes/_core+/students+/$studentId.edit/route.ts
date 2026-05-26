import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 生徒編集画面で利用する詳細データを取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const studentId = params.studentId;
  if (!studentId) {
    throw new Response("studentId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { studentById } = await sdk.studentById({ studentId });
  return { student: studentById };
};

// 生徒更新アクションを実行する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const studentId = params.studentId;
  if (!studentId) {
    throw new Response("studentId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = await request.json();
  const { updateStudent } = await sdk.updateStudent({ studentId, input });

  return {
    message: updateStudent ? "ok" : "ng",
    student: updateStudent ?? undefined,
    notify: updateStudent
      ? { type: "success" as const, message: "生徒を更新しました" }
      : { type: "error" as const, message: "更新に失敗しました" },
  };
};
