import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as CreateMemberAction } from "~/routes/_core+/members+/create/route";

type CreateMemberActionData = Awaited<ReturnType<typeof CreateMemberAction>>;

// 会員作成 action を route から切り離して扱う。
export const useMemberCreate = (onSuccess?: () => void) =>
  useActionFetcher<CreateMemberActionData>({
    defaultAction: "/members/create",
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
