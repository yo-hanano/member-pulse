import { invalidateMasterBranches } from "~/hooks/useMasterData";
import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as DeleteBranchAction } from "~/routes/_core+/branches+/$branchId.delete/route";

type DeleteBranchActionData = Awaited<ReturnType<typeof DeleteBranchAction>>;

// 拠点削除 action を route から切り離して扱う。
export const useBranchDelete = (onSuccess?: () => void) =>
  useActionFetcher<DeleteBranchActionData>({
    defaultAction: ({ branchId }: { branchId: string }) => `/branches/${branchId}/delete`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      invalidateMasterBranches();
      onSuccess?.();
    },
  });
