import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as EditScheduleEventAction } from "~/routes/_core+/schedule-events+/$scheduleEventId.edit/route";

type EditScheduleEventActionData = Awaited<ReturnType<typeof EditScheduleEventAction>>;

// 訪問・来塾予定更新 action を route から切り離して扱う。
export const useScheduleEventEdit = (onSuccess?: () => void) =>
  useActionFetcher<EditScheduleEventActionData>({
    defaultAction: ({ scheduleEventId }: { scheduleEventId: string }) => `/schedule-events/${scheduleEventId}/edit`,
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
