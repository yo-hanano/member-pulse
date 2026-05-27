import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { employeeFormSchema } from "~/routes/_core+/employees+/_index/employee-form-schema";
import { getGraphQLClient } from "~/services/graphql-client";

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

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
  try {
    const { employeeId } = params;
    const client = getGraphQLClient();
    const sdk = getSdk(client);
    const inputs = employeeFormSchema.parse(await request.json());
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
  } catch (error) {
    return {
      message: "ng",
      employee: undefined,
      notify: { type: "error", message: errorMessage(error, "更新に失敗しました") },
    };
  }

  return {
    message: "ng",
    employee: undefined,
    notify: { type: "error", message: "更新に失敗しました" },
  };
};
