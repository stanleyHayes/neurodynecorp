import { ApiClient } from "@neurodyne/shared";

export const api = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  getToken: () => null,
});
