import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as CreateScheduleEventAction } from "~/routes/_core+/schedule-events+/create/route";

type CreateScheduleEventActionData = Awaited<ReturnType<typeof CreateScheduleEventAction>>;

// 訪問・来塾予定作成 action を route から切り離して扱う。
export const useScheduleEventCreate = (onSuccess?: () => void) =>
  useActionFetcher<CreateScheduleEventActionData>({
    defaultAction: "/schedule-events/create",
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
