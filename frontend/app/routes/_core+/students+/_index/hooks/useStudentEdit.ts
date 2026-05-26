import { useActionFetcher } from "~/hooks/useActionFetcher";
import { invalidateMasterStudents } from "~/hooks/useMasterData";
import type { clientAction as EditStudentAction } from "~/routes/_core+/students+/$studentId.edit/route";

type EditStudentActionData = Awaited<ReturnType<typeof EditStudentAction>>;

// 生徒更新 action を route から切り離して扱う。
export const useStudentEdit = (onSuccess?: () => void) =>
  useActionFetcher<EditStudentActionData>({
    defaultAction: ({ studentId }: { studentId: string }) => `/students/${studentId}/edit`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      invalidateMasterStudents();
      onSuccess?.();
    },
  });
