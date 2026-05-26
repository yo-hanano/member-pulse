import { type ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

type ScheduleEventForm = {
  activityAt: string;
  activityType: string;
  leadId: string;
  note?: string;
  reason?: string;
  status: string;
};

const toScheduleEventInput = (form: ScheduleEventForm) => ({
  scheduleSubjectId: form.leadId,
  scheduleType: form.activityType,
  scheduledAt: form.activityAt,
  status: form.status,
  reason: form.reason || undefined,
  note: form.note || undefined,
});

// 訪問・来塾予定作成アクションを実行する。
export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const form = (await request.json()) as ScheduleEventForm;
  const { createScheduleEvent } = await sdk.createScheduleEvent({ input: toScheduleEventInput(form) });

  return {
    message: createScheduleEvent ? "ok" : "ng",
    scheduleEvent: createScheduleEvent ?? undefined,
    notify: createScheduleEvent
      ? { type: "success" as const, message: "訪問・来塾予定を登録しました" }
      : { type: "error" as const, message: "新規登録に失敗しました" },
  };
};
