import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as DeleteMemberAction } from "~/routes/_core+/members+/$memberId.delete/route";

type DeleteMemberActionData = Awaited<ReturnType<typeof DeleteMemberAction>>;

// 会員削除 action を route から切り離して扱う。
export const useMemberDelete = (onSuccess?: () => void) =>
  useActionFetcher<DeleteMemberActionData>({
    defaultAction: ({ memberId }: { memberId: string }) => `/members/${memberId}/delete`,
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
