import { useActionFetcher } from "~/hooks/useActionFetcher";
import { invalidateMasterStudents } from "~/hooks/useMasterData";
import type { clientAction as CreateStudentAction } from "~/routes/_core+/students+/create/route";

type CreateStudentActionData = Awaited<ReturnType<typeof CreateStudentAction>>;

// 生徒作成 action を route から切り離して扱う。
export const useStudentCreate = (onSuccess?: () => void) =>
  useActionFetcher<CreateStudentActionData>({
    defaultAction: "/students/create",
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      invalidateMasterStudents();
      onSuccess?.();
    },
  });
