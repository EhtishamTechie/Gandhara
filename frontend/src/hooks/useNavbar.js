import { useState, useEffect, useCallback } from 'react';

export const useNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
      setIsShopDropdownOpen(false);
      setIsSearchOpen(false);
    };

    // Listen for route changes (if using React Router)
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isShopDropdownOpen && !event.target.closest('.shop-dropdown')) {
        setIsShopDropdownOpen(false);
      }
    };

    if (isShopDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isShopDropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Close mobile menu on Escape
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsShopDropdownOpen(false);
        setIsSearchOpen(false);
      }
      
      // Open search with Ctrl+K or Cmd+K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle functions
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
    // Close other menus
    setIsShopDropdownOpen(false);
    setIsSearchOpen(false);
  }, []);

  const toggleShopDropdown = useCallback(() => {
    setIsShopDropdownOpen(prev => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => !prev);
    if (!isSearchOpen) {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  // Close functions
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const closeShopDropdown = useCallback(() => {
    setIsShopDropdownOpen(false);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, []);

  // Search function
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement your search logic here
      console.log("Searching for:", searchQuery);
      
      // You can navigate to search results page here
      // For example: navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      
      closeSearch();
    }
  }, [searchQuery, closeSearch]);

  // WhatsApp function
  const openWhatsApp = useCallback(() => {
    const phoneNumber = "923005567507";
    const message = "Hello! I'm interested in wholesale dealership opportunities with Gandhara Arts and Taxila Stone Crafts.";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  }, []);

  return {
    // State
    isScrolled,
    isMobileMenuOpen,
    isShopDropdownOpen,
    searchQuery,
    isSearchOpen,

    // Actions
    toggleMobileMenu,
    toggleShopDropdown,
    toggleSearch,
    closeMobileMenu,
    closeShopDropdown,
    closeSearch,
    handleSearch,
    openWhatsApp,
    setSearchQuery
  };
};

// Custom hook for navigation items
export const useNavigationItems = () => {
  const coreMenuItems = [
    { name: "Home", path: "/", icon: "🏠", description: "Return to homepage" },
    { name: "All Products", path: "/products", icon: "🛍️", description: "Browse all stone crafts" },
    { name: "Our Masters", path: "/our-masters", icon: "👨‍🎨", description: "Meet our skilled artisans" },
    { name: "About", path: "/about", icon: "ℹ️", description: "Learn about our heritage" },
    { name: "Contact", path: "/Contact", icon: "📞", description: "Get in touch with us" }
  ];

  // Categories are fetched dynamically from the backend via useCategoryList
  // ProfessionalNavbar can use useCategoryList directly if needed
  const shopCategoryItems = [];

  const getCategoryPath = (item) => `/category/${item.replace(/\s+/g, "-").toLowerCase()}`;

  return {
    coreMenuItems,
    shopCategoryItems,
    featuredCategories: [],
    getCategoryPath
  };
};

export default useNavbar;
