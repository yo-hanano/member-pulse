import { useActionFetcher } from "~/hooks/useActionFetcher";
import { invalidateMasterAreas } from "~/hooks/useMasterData";
import type { clientAction as EditAreaAction } from "~/routes/_core+/areas+/$areaId.edit/route";

type EditAreaActionData = Awaited<ReturnType<typeof EditAreaAction>>;

// エリア更新 action を route から切り離して扱う。
export const useAreaEdit = (onSuccess?: () => void) =>
  useActionFetcher<EditAreaActionData>({
    defaultAction: ({ areaId }: { areaId: string }) => `/areas/${areaId}/edit`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      invalidateMasterAreas();
      onSuccess?.();
    },
  });
