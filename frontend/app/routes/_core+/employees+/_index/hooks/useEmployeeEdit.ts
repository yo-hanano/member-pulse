import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as EditEmployeeAction } from "~/routes/_core+/employees+/$employeeId.edit/route";

type EditEmployeeActionData = Awaited<ReturnType<typeof EditEmployeeAction>>;

export const useEmployeeEdit = (onSuccess?: () => void) =>
  useActionFetcher<EditEmployeeActionData>({
    defaultAction: ({ employeeId }: { employeeId: string }) => `/employees/${employeeId}/edit`,
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
