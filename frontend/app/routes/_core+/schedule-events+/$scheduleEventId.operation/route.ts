import { type ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

type ScheduleEventOperationForm = {
  activityAt?: string;
  activityType?: string;
  mode: "reschedule" | "cancel" | "done";
  note?: string;
  reason?: string;
};

// 最新予定に対する履歴操作を実行する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const scheduleEventId = params.scheduleEventId;
  if (!scheduleEventId) {
    throw new Response("scheduleEventId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const form = (await request.json()) as ScheduleEventOperationForm;

  if (form.mode === "reschedule") {
    const { rescheduleScheduleEvent } = await sdk.rescheduleScheduleEvent({
      scheduleEventId,
      input: {
        scheduleType: form.activityType ?? "trial_lesson",
        scheduledAt: form.activityAt ?? "",
        reason: form.reason ?? "",
        note: form.note || undefined,
      },
    });
    return result(rescheduleScheduleEvent, "日程変更を登録しました");
  }

  if (form.mode === "cancel") {
    const { cancelScheduleEvent } = await sdk.cancelScheduleEvent({
      scheduleEventId,
      input: { reason: form.reason ?? "", note: form.note || undefined },
    });
    return result(cancelScheduleEvent, "キャンセルを登録しました");
  }

  if (form.mode === "done") {
    const { completeScheduleEvent } = await sdk.completeScheduleEvent({
      scheduleEventId,
      input: { note: form.note || undefined },
    });
    return result(completeScheduleEvent, "実施済みにしました");
  }

  throw new Response("unsupported operation mode", { status: 400 });
};

const result = (scheduleEvent: unknown, successMessage: string) => ({
  message: scheduleEvent ? "ok" : "ng",
  scheduleEvent: scheduleEvent ?? undefined,
  notify: scheduleEvent
    ? { type: "success" as const, message: successMessage }
    : { type: "error" as const, message: "予定操作に失敗しました" },
});
