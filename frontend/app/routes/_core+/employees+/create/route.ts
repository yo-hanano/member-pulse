import type { ActionFunctionArgs } from "react-router";

import { getSdk } from "~/generated/graphql";
import { employeeFormSchema } from "~/routes/_core+/employees+/_index/employee-form-schema";
import { getGraphQLClient } from "~/services/graphql-client";

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const clientAction = async ({ request }: ActionFunctionArgs) => {
  try {
    const client = getGraphQLClient();
    const sdk = getSdk(client);
    const inputs = employeeFormSchema.parse(await request.json());
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
  } catch (error) {
    return {
      message: "ng",
      employee: undefined,
      notify: { type: "error", message: errorMessage(error, "新規登録に失敗しました") },
    };
  }

  return {
    message: "ng",
    employee: undefined,
    notify: { type: "error", message: "新規登録に失敗しました" },
  };
};
