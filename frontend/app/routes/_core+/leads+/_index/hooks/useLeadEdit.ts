import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as EditLeadAction } from "~/routes/_core+/leads+/$leadId.edit/route";

type EditLeadActionData = Awaited<ReturnType<typeof EditLeadAction>>;

// リード更新 action を route から切り離して扱う。
export const useLeadEdit = (onSuccess?: () => void) =>
  useActionFetcher<EditLeadActionData>({
    defaultAction: ({ leadId }: { leadId: string }) => `/leads/${leadId}/edit`,
    method: "post",
    encType: "application/json",
    onSuccess: () => onSuccess?.(),
  });
