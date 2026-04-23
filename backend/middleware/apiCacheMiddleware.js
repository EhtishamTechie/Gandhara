// Simple in-memory cache middleware for API responses
// Caches GET requests to reduce database load

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const apiCache = (duration = CACHE_DURATION) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      // For mutating requests (POST/PUT/DELETE), clear the entire cache
      // so subsequent GETs return fresh data
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        cache.clear();
      }
      return next();
    }

    // Skip caching for admin routes
    if (req.path.includes('/admin/')) {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      const { body, timestamp, headers } = cachedResponse;
      
      // Check if cache is still valid
      if (Date.now() - timestamp < duration) {
        // Set cached headers
        Object.keys(headers).forEach(header => {
          res.setHeader(header, headers[header]);
        });
        
        // Add cache hit header for debugging
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Age', Math.floor((Date.now() - timestamp) / 1000));
        
        return res.json(body);
      } else {
        // Cache expired, delete it
        cache.delete(key);
      }
    }

    // Cache miss - store original res.json
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const headers = {
          'Content-Type': 'application/json',
          // Don't instruct browser to cache API responses — only use server-side Map cache
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        };
        
        cache.set(key, {
          body,
          timestamp: Date.now(),
          headers
        });
        
        // Set headers
        Object.keys(headers).forEach(header => {
          res.setHeader(header, headers[header]);
        });
        
        res.setHeader('X-Cache', 'MISS');
      }
      
      return originalJson(body);
    };

    next();
  };
};

// Clear cache periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 2) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Manual cache clear function
apiCache.clear = () => {
  cache.clear();
  console.log('API cache cleared');
};

// Get cache stats
apiCache.stats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    totalSize: JSON.stringify(Array.from(cache.values())).length
  };
};

module.exports = apiCache;
