import type { ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

export const clientAction = async ({ params }: ActionFunctionArgs) => {
  const { employeeId } = params;
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { deleteEmployee: result } = await sdk.deleteEmployee({
    employeeId: String(employeeId),
  });

  if (result) {
    return {
      message: "ok",
      employee: { id: employeeId },
      notify: { type: "success", message: "従業員を削除しました" },
    };
  }
  return {
    message: "ng",
    employee: undefined,
    notify: { type: "error", message: "従業員削除に失敗しました" },
  };
};
