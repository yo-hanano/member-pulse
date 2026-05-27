import { useActionFetcher } from "~/hooks/useActionFetcher";
import type { clientAction as CreateLocationAction } from "~/routes/_core+/locations+/create/route";

export const useLocationCreate = (onSuccess?: () => void) =>
  useActionFetcher<Awaited<ReturnType<typeof CreateLocationAction>>>({
    defaultAction: "/locations/create",
    onSuccess,
  });
