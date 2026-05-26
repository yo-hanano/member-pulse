import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 講師編集画面で利用する詳細データを取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const teacherId = params.teacherId;
  if (!teacherId) {
    throw new Response("teacherId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { teacherById } = await sdk.teacherById({ teacherId });
  return { teacher: teacherById };
};

// 講師更新アクションを実行する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const teacherId = params.teacherId;
  if (!teacherId) {
    throw new Response("teacherId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = await request.json();
  const normalizedInput = {
    ...input,
    birthday: input?.birthday ? input.birthday : null,
  };
  const { updateTeacher } = await sdk.updateTeacher({ teacherId, input: normalizedInput });

  return {
    message: updateTeacher ? "ok" : "ng",
    teacher: updateTeacher ?? undefined,
    notify: updateTeacher
      ? { type: "success" as const, message: "講師を更新しました" }
      : { type: "error" as const, message: "更新に失敗しました" },
  };
};
