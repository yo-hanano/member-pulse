import { invalidateMasterBranches } from "~/hooks/useMasterData";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as CreateBranchAction } from "~/routes/_core+/branches+/create/route";

type CreateBranchActionData = Awaited<ReturnType<typeof CreateBranchAction>>;

// 拠点作成 action を route から切り離して扱う。
export const useBranchCreate = (onSuccess?: () => void) =>
  useActionFetcher<CreateBranchActionData>({
    defaultAction: "/branches/create",
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      invalidateMasterBranches();
      onSuccess?.();
    },
  });
