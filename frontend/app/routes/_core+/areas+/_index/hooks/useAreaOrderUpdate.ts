import { invalidateMasterAreas } from "~/hooks/useMasterData";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as UpdateAreaOrderAction } from "~/routes/_core+/areas+/order/route";

type UpdateAreaOrderActionData = Awaited<ReturnType<typeof UpdateAreaOrderAction>>;

// エリア並び順更新 action を route から切り離して扱う。
export const useAreaOrderUpdate = (onSuccess?: () => void) =>
  useActionFetcher<UpdateAreaOrderActionData>({
    defaultAction: "/areas/order",
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      invalidateMasterAreas();
      onSuccess?.();
    },
  });
