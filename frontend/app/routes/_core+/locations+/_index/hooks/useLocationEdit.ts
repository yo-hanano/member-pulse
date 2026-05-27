import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as EditLocationAction } from "~/routes/_core+/locations+/$locationId.edit/route";

export const useLocationEdit = (onSuccess?: () => void) =>
  useActionFetcher<Awaited<ReturnType<typeof EditLocationAction>>>({
    defaultAction: ({ locationId }: { locationId: string }) => `/locations/${locationId}/edit`,
    onSuccess,
  });
