// src/pages/SearchPage.jsx
'use client';

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from "axios";
import '../styles/animations.css';
import { Search, X, Package, Tag, Grid3x3, Wind, Feather } from "lucide-react";
import { getImageUrl } from "../utils/imageHelper.js";
import OptimizedImage from '../components/OptimizedImage';

// Decorative Pattern Component - matching AllProductsPage
const DecorativePattern = ({ className }) => (
  <div className={`absolute pointer-events-none ${className}`}>
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.15">
      <path d="M60 0L74.2857 45.7143L120 60L74.2857 74.2857L60 120L45.7143 74.2857L0 60L45.7143 45.7143L60 0Z" fill="url(#paint0_linear)" />
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E6A44E" />
          <stop offset="1" stopColor="#F1C27D" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get image path helper - matching AllProductsPage
  const getImagePath = (imageName) => {
    if (typeof imageName === 'string' && imageName.trim() !== '') {
      if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
        return imageName;
      }
      const path = imageName.startsWith('/') ? imageName.substring(1) : imageName;
      return getImageUrl(path);
    }
    return '/GandharaImages/Gandharalogo.webp';
  };

  // Server-side search — fetch only matching products, not the entire catalog
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredProducts([]);
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const isDev = import.meta.env.DEV;
        const baseUrl = isDev 
          ? '/api/products'
          : `${import.meta.env.VITE_API_URL || window.location.origin}/api/products`;
        
        const response = await axios.get(`${baseUrl}/search`, {
          params: { q: query.trim(), limit: 50 }
        });
        setFilteredProducts(response.data.products || []);
        setLoading(false);
      } catch (err) {
        console.error("Error searching products:", err);
        setError("Failed to search products");
        setLoading(false);
      }
    };

    // Debounce search requests
    const timer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setFilteredProducts([]);
  };

  // Navigate to product detail
  const handleProductClick = (product) => {
    navigate(`/product/${product.slug || product._id}`);
  };

  // Highlight search term in text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="bg-amber-200 text-slate-900 px-1 rounded">{part}</mark> : 
        part
    );
  };

  return (
    <div className="bg-gray-50 md:bg-[#0F172A] min-h-screen font-sans selection:bg-[#F1C27D] selection:text-[#0F172A] relative">
      {/* Desktop Decorative patterns */}
      <div className="hidden md:block">
        <DecorativePattern className="top-10 left-10 opacity-20 rotate-12" />
        <DecorativePattern className="bottom-20 right-10 opacity-10 -rotate-12" />
        <DecorativePattern className="top-1/3 right-1/4 opacity-5 rotate-45" />
      </div>

      <div className="container mx-auto max-w-screen-xl p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Mobile-optimized header */}
        <div className="md:hidden mb-6 pt-4">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Search Products
          </h1>
          <p className="text-gray-600 text-sm text-center">
            Find your perfect stone craft
          </p>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block">
          <div className="w-24 h-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] rounded-full mx-auto mb-8"></div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 sm:mb-6 text-center tracking-tight bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent animate-fadeIn">
            Search Products
          </h1>
          
          <p className="text-[#E2E8F0] text-lg max-w-2xl mx-auto text-center mb-8 animate-fadeInUp animation-delay-1">
            Find your perfect stone craft from our collection
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-[#F1C27D] to-[#E6A44E] rounded-full mx-auto mb-10"></div>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8 animate-fadeIn animation-delay-2">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F1C27D] md:text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, category, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-24 py-3 md:py-4 bg-white md:bg-[#1E293B] border border-gray-200 md:border-[#334155] rounded-xl text-gray-800 md:text-[#F8FAFC] placeholder-gray-500 md:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#F1C27D] focus:border-transparent transition-all duration-300 shadow-sm md:shadow-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-500 md:text-[#94A3B8] hover:text-[#F1C27D] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-white px-4 md:px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 text-xl">{error}</div>
          </div>
        ) : !searchQuery.trim() ? (
          <div className="text-center py-20 animate-fadeInUp">
            <Search className="w-24 h-24 text-gray-300 md:text-[#334155] mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 md:text-[#E2E8F0] mb-2">
              Start Searching
            </h2>
            <p className="text-gray-500 md:text-[#94A3B8] text-lg">
              Enter a keyword to search our collection of authentic stone crafts
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 animate-scaleIn">
            <Package className="w-24 h-24 text-gray-300 md:text-[#334155] mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 md:text-[#E2E8F0] mb-2">
              No Results Found
            </h2>
            <p className="text-gray-500 md:text-[#94A3B8] text-lg mb-4">
              No products found matching "<span className="font-semibold text-[#E6A44E] md:text-[#F1C27D]">{searchQuery}</span>"
            </p>
            <button
              onClick={clearSearch}
              className="text-[#E6A44E] md:text-[#F1C27D] hover:text-[#F1C27D] font-medium underline"
            >
              Clear search and try again
            </button>
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="mb-8 animate-fadeInUp">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 md:text-[#E2E8F0]">
                  Search Results
                </h2>
                <div className="flex items-center space-x-2 text-gray-600 md:text-[#94A3B8]">
                  <Grid3x3 className="w-5 h-5" />
                  <span className="font-medium">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                  </span>
                </div>
              </div>
              <p className="text-gray-600 md:text-[#94A3B8]">
                Showing results for "<span className="font-semibold text-[#E6A44E] md:text-[#F1C27D]">{searchQuery}</span>"
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => {
                const primaryImageSrc = product.images && product.images.length > 0 && product.images[0]
                  ? getImagePath(product.images[0])
                  : getImagePath(product.image);

                return (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product)}
                    className={`group relative bg-white md:bg-[#1E293B] rounded-2xl md:rounded-xl shadow-sm md:shadow-xl hover:shadow-lg md:hover:shadow-2xl overflow-hidden transition-all duration-500 cursor-pointer animate-fadeInUp animation-delay-${index % 5}`}
                  >
                    {/* Product Image */}
                    <div className="relative h-56 md:h-64 overflow-hidden bg-gray-100 md:bg-[#0F172A]">
                      <div className="w-full h-full hover-scale">
                        <OptimizedImage
                          src={primaryImageSrc}
                          alt={product.title || "Product"}
                          className="w-full h-full object-cover select-none"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/GandharaImages/Gandharalogo.webp';
                          }}
                          width={400}
                          height={400}
                          objectFit="cover"
                          lazy={index > 6}
                          priority={index < 3}
                        />
                      </div>
                      
                      {/* Category Badge */}
                      {product.category && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>{product.category}</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 md:p-5">
                      <h3 className="text-base md:text-lg font-bold text-gray-800 md:text-[#F8FAFC] mb-2 line-clamp-2 group-hover:text-[#E6A44E] md:group-hover:text-[#F1C27D] transition-colors">
                        {product.title || "Untitled Product"}
                      </h3>
                      
                      {product.shortDescription && (
                        <p className="text-sm text-gray-600 md:text-[#CBD5E1] mb-3 line-clamp-2">
                          {product.shortDescription}
                        </p>
                      )}

                      {product.subcategory && (
                        <div className="flex items-center text-xs text-gray-500 md:text-[#94A3B8] mb-3">
                          <Grid3x3 className="w-3 h-3 mr-1" />
                          <span>{product.subcategory}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-200 md:border-[#334155]">
                        <button className="w-full bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-white py-2 md:py-2.5 rounded-lg font-medium transition-all duration-200 transform group-hover:scale-105 shadow-md">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
