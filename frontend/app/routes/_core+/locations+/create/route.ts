import type { ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import {
  locationFormSchema,
  toLocationInput,
} from "~/routes/_core+/locations+/_index/location-form-schema";
import { getGraphQLClient } from "~/services/graphql-client";

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const clientAction = async ({ request }: ActionFunctionArgs) => {
  try {
    const client = getGraphQLClient();
    const sdk = getSdk(client);
    const inputs = toLocationInput(locationFormSchema.parse(await request.json()));
    const { createLocation: result } = await sdk.createLocation({
      input: inputs,
    });

    if (result) {
      return {
        message: "ok",
        location: result,
        notify: { type: "success", message: "拠点を登録しました" },
      };
    }
  } catch (error) {
    return {
      message: "ng",
      location: undefined,
      notify: { type: "error", message: errorMessage(error, "新規登録に失敗しました") },
    };
  }

  return {
    message: "ng",
    location: undefined,
    notify: { type: "error", message: "新規登録に失敗しました" },
  };
};
