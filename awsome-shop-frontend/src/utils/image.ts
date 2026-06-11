const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Resolve a product image URL for `<img>` display.
 *
 * The product service stores/returns image URLs as service-internal relative
 * paths like `/api/files/xxx.jpg`, but they are exposed through the gateway
 * under the `/product` prefix (`/product/api/files/xxx.jpg`).
 *
 * This helper:
 *  - leaves absolute URLs (http/https/data/blob) untouched;
 *  - adds the `/product` gateway prefix to `/api/...` paths;
 *  - prepends the API base URL so images still load when the SPA is served
 *    from a different origin than the API (e.g. local dev → CloudFront).
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  let path = url;
  if (path.startsWith("/api/")) {
    path = "/product" + path;
  } else if (!path.startsWith("/")) {
    // bare filename → assume product file path
    path = "/product/api/files/" + path;
  }
  return `${API_BASE}${path}`;
}
