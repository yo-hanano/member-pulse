import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as ScheduleEventOperationAction } from "~/routes/_core+/schedule-events+/$scheduleEventId.operation/route";

type ScheduleEventOperationActionData = Awaited<ReturnType<typeof ScheduleEventOperationAction>>;

// 予定履歴操作 action を route から切り離して扱う。
export const useScheduleEventOperation = (onSuccess?: () => void) =>
  useActionFetcher<ScheduleEventOperationActionData>({
    defaultAction: ({ scheduleEventId }: { scheduleEventId: string }) => `/schedule-events/${scheduleEventId}/operation`,
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
