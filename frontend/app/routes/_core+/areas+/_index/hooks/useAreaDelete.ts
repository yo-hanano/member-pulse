import { invalidateMasterAreas } from "~/hooks/useMasterData";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as DeleteAreaAction } from "~/routes/_core+/areas+/$areaId.delete/route";

type DeleteAreaActionData = Awaited<ReturnType<typeof DeleteAreaAction>>;

// エリア削除 action を route から切り離して扱う。
export const useAreaDelete = (onSuccess?: () => void) =>
  useActionFetcher<DeleteAreaActionData>({
    defaultAction: ({ areaId }: { areaId: string }) => `/areas/${areaId}/delete`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      invalidateMasterAreas();
      onSuccess?.();
    },
  });
