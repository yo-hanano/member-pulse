import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as CreateEmployeeAction } from "~/routes/_core+/employees+/create/route";

type CreateEmployeeActionData = Awaited<ReturnType<typeof CreateEmployeeAction>>;

export const useEmployeeCreate = (onSuccess?: () => void) =>
  useActionFetcher<CreateEmployeeActionData>({
    defaultAction: "/employees/create",
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
