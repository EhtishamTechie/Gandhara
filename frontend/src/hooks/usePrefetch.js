// Route prefetching for instant navigation
// Document prefetching removed - caused 503 noise from Cloudflare for SPA routes.
// SPA navigation is instant via React Router; no document prefetch needed.

// Document prefetching removed - caused 503 noise from Cloudflare for SPA routes.
// SPA navigation is instant via React Router; no document prefetch needed.
export const usePrefetch = () => {
  // intentionally empty - React Router handles route transitions natively
};

// Prefetch API data
export const prefetchProducts = async () => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      fetch('/api/products?limit=20').catch(() => {});
    });
  }
};
