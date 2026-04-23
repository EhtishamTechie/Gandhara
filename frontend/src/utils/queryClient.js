// API Query Client Configuration
import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized settings for performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep inactive data in cache for 15 minutes (gcTime replaces deprecated cacheTime in v5)
      gcTime: 15 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus in production (avoids flicker)
      refetchOnWindowFocus: import.meta.env.MODE === 'development',
      // Refetch on mount if data is stale — ensures navigating back shows fresh data
      refetchOnMount: true,
      // Dedupe requests within 1 second
      refetchInterval: false,
    },
  },
});
