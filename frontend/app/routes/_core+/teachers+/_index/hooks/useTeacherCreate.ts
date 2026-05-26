import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as CreateTeacherAction } from "~/routes/_core+/teachers+/create/route";

type CreateTeacherActionData = Awaited<ReturnType<typeof CreateTeacherAction>>;

// 講師作成 action を route から切り離して扱う。
export const useTeacherCreate = (onSuccess?: () => void) =>
  useActionFetcher<CreateTeacherActionData>({
    defaultAction: "/teachers/create",
    method: "post",
    encType: "application/json",
    onSuccess,
  });
