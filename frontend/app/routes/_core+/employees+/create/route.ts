import type { ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

export const clientAction = async ({ request }: ActionFunctionArgs) => {
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const inputs = await request.json();
  const { createEmployee: result } = await sdk.createEmployee({
    input: inputs,
  });

  if (result) {
    return {
      message: "ok",
      employee: result,
      notify: { type: "success", message: "従業員を登録しました" },
    };
  }
  return {
    message: "ng",
    employee: undefined,
    notify: { type: "error", message: "新規登録に失敗しました" },
  };
};
