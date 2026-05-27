import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as DeleteLocationAction } from "~/routes/_core+/locations+/$locationId.delete/route";

export const useLocationDelete = (onSuccess?: () => void) =>
  useActionFetcher<Awaited<ReturnType<typeof DeleteLocationAction>>>({
    defaultAction: ({ locationId }: { locationId: string }) => `/locations/${locationId}/delete`,
    onSuccess,
  });
