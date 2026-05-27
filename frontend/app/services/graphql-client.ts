import { ClientError, GraphQLClient } from "graphql-request";

// GraphQL の業務エラーを route action 側で扱える Response 形式へ変換する。
const graphQLErrorResponse = (error: ClientError) => {
  const message = error.response.errors?.[0]?.message ?? "GraphQL request failed";
  const status =
    error.response.status && error.response.status >= 400 ? error.response.status : 400;
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

export const getGraphQLClient = () => {
  // runtime config があればそれを優先し、なければ /graphql を使う。
  const runtimePath =
    typeof window === "undefined" ? undefined : window.__runtimeConfig?.graphqlPath;
  const path = runtimePath ?? "/graphql";
  const endpoint =
    typeof window === "undefined"
      ? path
      : path.startsWith("http")
        ? path
        : `${window.location.origin}${path}`;

  const client = new GraphQLClient(endpoint, {
    fetch: (input, init) => fetch(input, { ...init, credentials: "include" }),
  });

  const originalRequest = client.request.bind(client);
  client.request = (async (...args: Parameters<typeof client.request>) => {
    try {
      return await originalRequest(...args);
    } catch (error) {
      if (error instanceof ClientError) {
        throw graphQLErrorResponse(error);
      }
      throw error;
    }
  }) as typeof client.request;

  return client;
};
