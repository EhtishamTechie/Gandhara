/**
 * Resolve API paths for browser requests.
 * In development, use same-origin `/api/...` so Vite's proxy (vite.config.js)
 * forwards to the backend — same DB as other dev flows (e.g. AdminLogin).
 * In production, prefix with VITE_API_URL when the API is on another origin.
 */
export function resolveApiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (import.meta.env.DEV) {
    return p;
  }
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  return base ? `${base}${p}` : p;
}
