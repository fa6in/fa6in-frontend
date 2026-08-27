const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "/";

/**
 * HTTPS pages cannot call http:// APIs (browser Mixed Content block).
 * In that case, use same-origin "/" so Vercel/nginx can proxy /api securely.
 */
function resolveBaseUrl(url: string): string {
  const normalized = url.endsWith("/") || url === "/" ? url : `${url}/`;

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    /^http:\/\//i.test(normalized)
  ) {
    return "/";
  }

  return normalized;
}

export const BaseUrl = resolveBaseUrl(raw);
