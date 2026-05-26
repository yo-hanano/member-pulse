import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as InviteEmployeeAction } from "~/routes/_core+/employees+/invite/route";

type InviteEmployeeActionData = Awaited<ReturnType<typeof InviteEmployeeAction>>;

export const useEmployeeInvite = (onSuccess?: (data: InviteEmployeeActionData) => void) =>
  useActionFetcher<InviteEmployeeActionData>({
    defaultAction: "/employees/invite",
    method: "post",
    encType: "application/json",
    onSuccess,
  });
