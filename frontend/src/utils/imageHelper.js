export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/GandharaImages/Gandharalogo.webp';
  if (imagePath.startsWith('http')) return imagePath;
  
  // Environment-aware image URL handling
  const isDev = import.meta.env.DEV;
  const baseUrl = isDev 
    ? 'http://localhost:5000'  // Direct backend URL for static files in development
    : import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Full URL in production
  
  // Clean the image path
  let cleanPath = imagePath;
  
  // Remove leading slash if present
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Handle Windows backslashes (convert to forward slashes)
  cleanPath = cleanPath.replace(/\\/g, '/');
  
  // Remove duplicate uploads/ if present (handles uploads/uploads/ issue)
  if (cleanPath.startsWith('uploads/uploads/')) {
    cleanPath = cleanPath.replace('uploads/uploads/', 'uploads/');
  }
  
  // If path already starts with uploads/, use it directly
  if (cleanPath.startsWith('uploads/')) {
    return `${baseUrl}/${cleanPath}`;
  }
  
  // For simple filenames, add uploads/ prefix
  return `${baseUrl}/uploads/${cleanPath}`;
};

/**
 * getMediaUrl(url)
 * ----------------
 * Resolves a URL returned from the SiteMedia API into something
 * the browser can actually request.
 *
 *   https?://...            -> returned as-is
 *   /uploads/<...>          -> prefixed with the API base (served by Express)
 *   /GandharaImages/<...>
 *   /TourImages/<...>
 *   /ProductVideos/<...>
 *   any other /public path  -> returned as-is (served by Vite from /public)
 *   bare "foo.jpg"          -> treated as a backend upload under /uploads
 *
 * This is NOT a replacement for getImageUrl (which assumes every
 * non-absolute path is under /uploads). Use getMediaUrl only for
 * URLs coming from the SiteMedia collection where the origin is
 * mixed (seeded public paths + admin-uploaded files).
 */
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;

  const isDev = import.meta.env.DEV;
  const apiBase = isDev
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

  if (url.startsWith('/uploads/')) return `${apiBase}${url}`;
  if (url.startsWith('/')) return url; // other public-folder paths
  return `${apiBase}/uploads/${url}`;
};

export default getImageUrl;
