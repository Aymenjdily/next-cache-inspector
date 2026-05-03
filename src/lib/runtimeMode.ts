export const EMBEDDED_MODE_ENV_KEY = "NEXT_CACHE_INSPECTOR_EMBEDDED_MODE";
export const PUBLIC_EMBEDDED_MODE_ENV_KEY = "NEXT_PUBLIC_NEXT_CACHE_INSPECTOR_EMBEDDED_MODE";
export const GRAPH_PATH_ENV_KEY = "NEXT_CACHE_INSPECTOR_GRAPH_PATH";

/**
 * Detects whether the dashboard is running inside a target Next.js app.
 */
export function isEmbeddedMode(): boolean {
  const embeddedValue =
    process.env[EMBEDDED_MODE_ENV_KEY] ?? process.env[PUBLIC_EMBEDDED_MODE_ENV_KEY] ?? "false";

  return embeddedValue === "true";
}
