import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as EditMemberAction } from "~/routes/_core+/members+/$memberId.edit/route";

type EditMemberActionData = Awaited<ReturnType<typeof EditMemberAction>>;

// 会員更新 action を route から切り離して扱う。
export const useMemberEdit = (onSuccess?: () => void) =>
  useActionFetcher<EditMemberActionData>({
    defaultAction: ({ memberId }: { memberId: string }) => `/members/${memberId}/edit`,
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
