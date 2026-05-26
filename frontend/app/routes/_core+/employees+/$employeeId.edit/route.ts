import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { getGraphQLClient } from "~/services/graphql-client";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { employeeId } = params;
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { employeeById: employee } = await sdk.employeeById({
    employeeId: String(employeeId),
  });

  if (!employee) {
    throw new Response(null, { status: 404 });
  }
  return { employee };
};

export const clientAction = async ({ request, params }: ActionFunctionArgs) => {
  const { employeeId } = params;
  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const inputs = await request.json();
  const { updateEmployee: result } = await sdk.updateEmployee({
    employeeId: String(employeeId),
    input: inputs,
  });

  if (result) {
    return {
      message: "ok",
      employee: result,
      notify: { type: "success", message: "従業員を更新しました" },
    };
  }
  return {
    message: "ng",
    employee: undefined,
    notify: { type: "error", message: "更新に失敗しました" },
  };
};
