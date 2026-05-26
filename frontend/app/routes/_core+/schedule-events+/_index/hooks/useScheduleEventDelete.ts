import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as DeleteScheduleEventAction } from "~/routes/_core+/schedule-events+/$scheduleEventId.delete/route";

type DeleteScheduleEventActionData = Awaited<ReturnType<typeof DeleteScheduleEventAction>>;

// 訪問・来塾予定削除 action を route から切り離して扱う。
export const useScheduleEventDelete = (onSuccess?: () => void) =>
  useActionFetcher<DeleteScheduleEventActionData>({
    defaultAction: ({ scheduleEventId }: { scheduleEventId: string }) => `/schedule-events/${scheduleEventId}/delete`,
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
