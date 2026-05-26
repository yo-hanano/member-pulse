import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";

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

// 訪問・来塾予定編集画面で利用する詳細データを取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const scheduleEventId = params.scheduleEventId;
  if (!scheduleEventId) {
    throw new Response("scheduleEventId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { scheduleEventById } = await sdk.scheduleEventById({ scheduleEventId });
  return { scheduleEvent: scheduleEventById };
};

// 訪問・来塾予定更新アクションを実行する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const scheduleEventId = params.scheduleEventId;
  if (!scheduleEventId) {
    throw new Response("scheduleEventId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const form = (await request.json()) as ScheduleEventForm;
  const { updateScheduleEvent } = await sdk.updateScheduleEvent({
    scheduleEventId,
    input: toScheduleEventInput(form),
  });

  return {
    message: updateScheduleEvent ? "ok" : "ng",
    scheduleEvent: updateScheduleEvent ?? undefined,
    notify: updateScheduleEvent
      ? { type: "success" as const, message: "訪問・来塾予定を更新しました" }
      : { type: "error" as const, message: "更新に失敗しました" },
  };
};
