// Custom hooks for API calls using React Query
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fetch all products with pagination
export const useProducts = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/products?page=${page}&limit=${limit}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch products with infinite scroll
export const useInfiniteProducts = (limit = 20) => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axios.get(`${API_BASE_URL}/api/products?page=${pageParam}&limit=${limit}`);
      return data;
    },
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.products.length === limit;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch products by category
export const useProductsByCategory = (categoryName) => {
  return useQuery({
    queryKey: ['products', 'category', categoryName],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/products/category/${encodeURIComponent(categoryName)}`);
      return data;
    },
    enabled: !!categoryName, // Only run if categoryName exists
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch single product by ID or slug
export const useProduct = (idOrSlug) => {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/products/${idOrSlug}`);
      return data;
    },
    enabled: !!idOrSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual products
  });
};

// Fetch visit places
export const useVisitPlaces = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['visitPlaces', page, limit],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/visit-places?page=${page}&limit=${limit}`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch masters
export const useMasters = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['masters', page, limit],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/masters?page=${page}&limit=${limit}`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Prefetch products for better UX
export const prefetchProducts = (queryClient, page = 1) => {
  queryClient.prefetchQuery({
    queryKey: ['products', page],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/products?page=${page}`);
      return data;
    },
  });
};

// Fetch products grouped by admin-defined category order
export const useGroupedProducts = (limitPerCategory = 8) => {
  return useQuery({
    queryKey: ['products', 'grouped', limitPerCategory],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/products/grouped?limit=${limitPerCategory}`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch category list from backend (admin-managed)
export const useCategoryList = () => {
  return useQuery({
    queryKey: ['categoryOrder'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/category-order`);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 min — categories rarely change
    gcTime: 30 * 60 * 1000,
  });
};

// ----------------------------------------------------------------
// Section 3: Category tree + sidebar settings
// ----------------------------------------------------------------

// Full nested category tree (top-level + subcategories). Used by
// the right-side CategorySidebar component.
export const useCategoryTree = () => {
  return useQuery({
    queryKey: ['categoryTree'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/categories/tree`);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 min — tree rarely changes
    gcTime: 30 * 60 * 1000,
  });
};

// Sidebar override settings. Not needed by the public sidebar
// (the tree endpoint applies overrides server-side), but the
// admin UI in Section 7 reads this to populate the management
// screen.
export const useSidebarSettings = () => {
  return useQuery({
    queryKey: ['sidebarSettings'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/sidebar-settings`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ----------------------------------------------------------------
// Section 4: Site media slots (hero slides, tour slides, about
// gallery, founder portrait, home product videos, etc.)
// ----------------------------------------------------------------

// Fetch a single named slot. Returns { items, label, slotKey, ... }.
// Use for the public-facing page components.
export const useSiteMediaSlot = (slotKey) => {
  return useQuery({
    queryKey: ['siteMedia', slotKey],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/site-media/${encodeURIComponent(slotKey)}`
      );
      return data?.slot || null;
    },
    enabled: !!slotKey,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
};

// ----------------------------------------------------------------
// Section 7: theme settings (admin-overridable CSS custom properties)
// ----------------------------------------------------------------
export const useThemeSettings = () => {
  return useQuery({
    queryKey: ['themeSettings'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/api/theme-settings`);
      return data || { colors: {} };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
};

// Admin-only (used by the Phase 3 admin UI): list every slot
// including inactive items.
export const useAdminSiteMediaSlots = (enabled = true) => {
  return useQuery({
    queryKey: ['siteMedia', 'admin', 'all'],
    queryFn: async () => {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('adminToken')
        : null;
      const { data } = await axios.get(
        `${API_BASE_URL}/api/admin/site-media`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      return data?.slots || [];
    },
    enabled,
    staleTime: 30 * 1000,
  });
};

// Infinite scroll for a single category page — cached per category
export const useInfiniteProductsByCategory = (categoryName, limit = 20) => {
  return useInfiniteQuery({
    queryKey: ['products', 'category', categoryName, 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/products/category/${encodeURIComponent(categoryName)}?page=${pageParam}&limit=${limit}`
      );
      return data;
    },
    getNextPageParam: (lastPage) => {
      const products = lastPage?.products || lastPage || [];
      const hasMore = Array.isArray(products) && products.length === limit;
      const currentPage = lastPage?.page || 1;
      return hasMore ? currentPage + 1 : undefined;
    },
    enabled: !!categoryName,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

