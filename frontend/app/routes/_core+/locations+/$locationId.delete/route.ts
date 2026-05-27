import type { ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const clientAction = async ({ params }: ActionFunctionArgs) => {
  try {
    const { locationId } = params;
    const client = getGraphQLClient();
    const sdk = getSdk(client);
    const { deleteLocation: result } = await sdk.deleteLocation({ locationId: String(locationId) });

    if (result) {
      return {
        message: "ok",
        notify: { type: "success", message: "拠点を削除しました" },
      };
    }
  } catch (error) {
    return {
      message: "ng",
      notify: { type: "error", message: errorMessage(error, "削除に失敗しました") },
    };
  }

  return {
    message: "ng",
    notify: { type: "error", message: "削除に失敗しました" },
  };
};
