import { useActionFetcher } from "~/hooks/useActionFetcher";
import { invalidateMasterStudents } from "~/hooks/useMasterData";
import type { clientAction as DeleteStudentAction } from "~/routes/_core+/students+/$studentId.delete/route";

type DeleteStudentActionData = Awaited<ReturnType<typeof DeleteStudentAction>>;

// 生徒削除 action を route から切り離して扱う。
export const useStudentDelete = (onSuccess?: () => void) =>
  useActionFetcher<DeleteStudentActionData>({
    defaultAction: ({ studentId }: { studentId: string }) => `/students/${studentId}/delete`,
    method: "post",
    encType: "application/json",
    onSuccess: () => {
      invalidateMasterStudents();
      onSuccess?.();
    },
  });
