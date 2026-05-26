import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as CreateLeadAction } from "~/routes/_core+/leads+/create/route";

type CreateLeadActionData = Awaited<ReturnType<typeof CreateLeadAction>>;

// リード作成 action を route から切り離して扱う。
export const useLeadCreate = (onSuccess?: () => void) =>
  useActionFetcher<CreateLeadActionData>({
    defaultAction: "/leads/create",
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
