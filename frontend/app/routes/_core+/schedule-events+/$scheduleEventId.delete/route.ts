import { type ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

// 訪問・来塾予定削除アクションを実行する。
export const clientAction = async ({ params }: ActionFunctionArgs) => {
  const scheduleEventId = params.scheduleEventId;
  if (!scheduleEventId) {
    throw new Response("scheduleEventId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { deleteScheduleEvent } = await sdk.deleteScheduleEvent({ scheduleEventId });

  return {
    message: deleteScheduleEvent ? "ok" : "ng",
    notify: deleteScheduleEvent
      ? { type: "success" as const, message: "訪問・来塾予定を削除しました" }
      : { type: "error" as const, message: "削除に失敗しました" },
  };
};
