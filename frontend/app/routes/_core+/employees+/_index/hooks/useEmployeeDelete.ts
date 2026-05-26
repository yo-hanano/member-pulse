import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as DeleteEmployeeAction } from "~/routes/_core+/employees+/$employeeId.delete/route";

type DeleteEmployeeActionData = Awaited<ReturnType<typeof DeleteEmployeeAction>>;

export const useEmployeeDelete = (onSuccess?: () => void) =>
  useActionFetcher<DeleteEmployeeActionData>({
    defaultAction: ({ employeeId }: { employeeId: string }) => `/employees/${employeeId}/delete`,
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
