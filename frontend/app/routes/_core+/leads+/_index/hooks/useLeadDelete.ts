import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as DeleteLeadAction } from "~/routes/_core+/leads+/$leadId.delete/route";

type DeleteLeadActionData = Awaited<ReturnType<typeof DeleteLeadAction>>;

// リード削除 action を route から切り離して扱う。
export const useLeadDelete = (onSuccess?: () => void) =>
  useActionFetcher<DeleteLeadActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}/delete`,
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
