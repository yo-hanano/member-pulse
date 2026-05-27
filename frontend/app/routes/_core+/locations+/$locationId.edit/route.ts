import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

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

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { locationId } = params;
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { locationById: location } = await sdk.locationById({
    locationId: String(locationId),
  });

  if (!location) {
    throw new Response(null, { status: 404 });
  }
  return { location };
};

export const clientAction = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const { locationId } = params;
    const client = getGraphQLClient();
    const sdk = getSdk(client);
    const inputs = toLocationInput(locationFormSchema.parse(await request.json()));
    const { updateLocation: result } = await sdk.updateLocation({
      locationId: String(locationId),
      input: inputs,
    });

    if (result) {
      return {
        message: "ok",
        location: result,
        notify: { type: "success", message: "拠点を更新しました" },
      };
    }
  } catch (error) {
    return {
      message: "ng",
      location: undefined,
      notify: { type: "error", message: errorMessage(error, "更新に失敗しました") },
    };
  }

  return {
    message: "ng",
    location: undefined,
    notify: { type: "error", message: "更新に失敗しました" },
  };
};
