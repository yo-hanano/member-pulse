import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as DeleteTeacherAction } from "~/routes/_core+/teachers+/$teacherId.delete/route";

type DeleteTeacherActionData = Awaited<ReturnType<typeof DeleteTeacherAction>>;

// 講師削除 action を route から切り離して扱う。
export const useTeacherDelete = (onSuccess?: () => void) =>
  useActionFetcher<DeleteTeacherActionData>({
    defaultAction: ({ teacherId }: { teacherId: string }) => `/teachers/${teacherId}/delete`,
    method: "post",
    encType: "application/json",
    onSuccess,
  });
