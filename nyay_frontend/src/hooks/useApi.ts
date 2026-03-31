import { useCallback } from "react";

export type HttpMethod = "GET" | "POST";

export function useApi(basePath = "/api") {
  const callApi = useCallback(
    async <TResponse, TPayload = unknown>(
      endpoint: string,
      method: HttpMethod,
      payload?: TPayload
    ): Promise<TResponse> => {
      const response = await fetch(`${basePath}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: method === "POST" ? JSON.stringify(payload) : undefined
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "API call failed");
      }

      return (await response.json()) as TResponse;
    },
    [basePath]
  );

  return { callApi };
}
