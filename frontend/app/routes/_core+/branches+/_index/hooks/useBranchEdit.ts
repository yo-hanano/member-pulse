import { invalidateMasterBranches } from "~/hooks/useMasterData";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as EditBranchAction } from "~/routes/_core+/branches+/$branchId.edit/route";

type EditBranchActionData = Awaited<ReturnType<typeof EditBranchAction>>;

// 拠点更新 action を route から切り離して扱う。
export const useBranchEdit = (onSuccess?: () => void) =>
  useActionFetcher<EditBranchActionData>({
    defaultAction: ({ branchId }: { branchId: string }) => `/branches/${branchId}/edit`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      invalidateMasterBranches();
      onSuccess?.();
    },
  });
