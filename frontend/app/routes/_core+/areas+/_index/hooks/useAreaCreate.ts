import { useActionFetcher } from "~/hooks/useActionFetcher";
import { invalidateMasterAreas } from "~/hooks/useMasterData";
import type { clientAction as CreateAreaAction } from "~/routes/_core+/areas+/create/route";

type CreateAreaActionData = Awaited<ReturnType<typeof CreateAreaAction>>;

// エリア作成 action を route から切り離して扱う。
export const useAreaCreate = (onSuccess?: () => void) =>
  useActionFetcher<CreateAreaActionData>({
    defaultAction: "/areas/create",
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      invalidateMasterAreas();
      onSuccess?.();
    },
  });
