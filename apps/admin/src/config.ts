const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const defaultApiUrl = import.meta.env.PROD ? "https://api.neurodyne.dev" : "http://localhost:4000";

function secureProductionUrl(url: string): string {
  if (!import.meta.env.PROD) return url;
  if (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1")) return url;
  return url.replace(/^http:\/\//, "https://");
}

export const API_URL = secureProductionUrl(configuredApiUrl || defaultApiUrl).replace(/\/$/, "");
