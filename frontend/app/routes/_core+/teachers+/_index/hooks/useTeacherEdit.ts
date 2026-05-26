import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as EditTeacherAction } from "~/routes/_core+/teachers+/$teacherId.edit/route";

type EditTeacherActionData = Awaited<ReturnType<typeof EditTeacherAction>>;

// 講師更新 action を route から切り離して扱う。
export const useTeacherEdit = (onSuccess?: () => void) =>
  useActionFetcher<EditTeacherActionData>({
    defaultAction: ({ teacherId }: { teacherId: string }) => `/teachers/${teacherId}/edit`,
    method: "post",
    encType: "application/json",
    onSuccess,
  });
