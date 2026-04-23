// src/pages/AllProductsPage.jsx
'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGroupedProducts } from "../hooks/useApi";
import '../styles/animations.css';
import { getImageUrl } from "../utils/imageHelper.js";
import OptimizedImage from '../components/OptimizedImage';
import { X, ZoomIn, ZoomOut, ShoppingBag, Wind, Feather, ArrowRight, Eye, Star, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Breadcrumbs from '../components/Breadcrumbs';
// Canonical themed product card (Section 5 — replaces the old inline card).
import ProductCard from '../components/ProductCard';
import { buildProductWhatsAppUrl } from '../utils/whatsappHelper';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- Decorative SVG Pattern Component ---
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

// --- Decorative Border Component ---
const DecorativeBorder = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E6A44E]/60 to-transparent"></div>
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E6A44E]/60 to-transparent"></div>
    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#E6A44E]/60 to-transparent"></div>
    <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#E6A44E]/60 to-transparent"></div>
  </div>
);

// --- Search Component ---
const SearchBar = ({ searchTerm, onSearchChange, totalProducts, filteredCount }) => {
  return (
    <div className="max-w-md mx-auto mb-8 animate-fadeInUp animation-delay-300">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-[#F1C27D]" />
        </div>
        <input
          type="text"
          placeholder="Search products by title..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white md:bg-[#1E293B] border border-gray-200 md:border-[#334155] rounded-xl text-gray-800 md:text-[#F8FAFC] placeholder-gray-500 md:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#F1C27D] focus:border-transparent transition-all duration-300 shadow-sm md:shadow-none"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 md:text-[#94A3B8] hover:text-[#F1C27D] transition-colors duration-200 animate-scaleIn"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {/* Search Results Info */}
      {searchTerm && (
        <div className="mt-3 text-center text-sm text-gray-600 md:text-[#E2E8F0] animate-fadeIn">
          {filteredCount === 0 ? (
            <span className="text-[#E6A44E] md:text-[#F1C27D]">No products found matching "{searchTerm}"</span>
          ) : (
            <span>
              Showing {filteredCount} of {totalProducts} products
              {filteredCount !== totalProducts && ` matching "${searchTerm}"`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// --- WhatsApp Button Component ---
const WhatsAppButton = ({ phoneNumber, productName, product, className, children, ...props }) => {
  const cleanPhoneNumber = phoneNumber.replace(/\s+/g, "").replace("+", "");
  const whatsappLink = product
    ? buildProductWhatsAppUrl(product, cleanPhoneNumber)
    : (() => {
        const message = productName
          ? `Hello! I'm interested in your product: ${productName}. Could you please provide more details?`
          : "Hello! I'm interested in your products. Could you please provide more details?";
        return `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`;
      })();

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover-scale`}
      aria-label={`Order ${productName || 'product'} on WhatsApp`}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </a>
  );
};

// --- Skeleton Loader Component ---
const ProductCardSkeleton = () => (
  <div className="bg-white md:bg-[#1E293B] rounded-2xl md:rounded-xl shadow-sm md:shadow-md overflow-hidden animate-pulse aspect-[4/5] md:aspect-[3/4]">
    <div className="w-full h-full bg-gray-200 md:bg-[#334155]"></div>
  </div>
);

// --- Enhanced Image Viewer Component with Product Navigation ---
const ImageViewer = ({ 
  isOpen, 
  onClose, 
  allProducts = [], 
  currentProduct = null, 
  onProductChange 
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const imgRef = useRef(null);

  // Find current product index
  useEffect(() => {
    if (currentProduct && allProducts.length > 0) {
      const index = allProducts.findIndex(p => p._id === currentProduct._id);
      setCurrentProductIndex(index >= 0 ? index : 0);
    }
  }, [currentProduct, allProducts]);

  // Reset zoom and position when product changes
  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [currentProduct]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && allProducts.length > 1) {
        navigateProduct('prev');
      } else if (e.key === 'ArrowRight' && allProducts.length > 1) {
        navigateProduct('next');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, allProducts.length, currentProductIndex]);

  const navigateProduct = (direction) => {
    if (allProducts.length <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentProductIndex === allProducts.length - 1 ? 0 : currentProductIndex + 1;
    } else {
      newIndex = currentProductIndex === 0 ? allProducts.length - 1 : currentProductIndex - 1;
    }
    
    const newProduct = allProducts[newIndex];
    setCurrentProductIndex(newIndex);
    onProductChange(newProduct);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleImageClick = (e) => {
    if (zoomLevel === 1) {
      handleZoomIn();
    }
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || !currentProduct) return null;

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

  const currentImage = currentProduct.images && currentProduct.images.length > 0 
    ? getImagePath(currentProduct.images[0]) 
    : getImagePath(currentProduct.image);

  if (!isOpen || !currentProduct) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fadeIn"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X size={32} />
        </button>

        {/* Navigation Arrows - Only show when multiple products */}
        {allProducts.length > 1 && (
          <>
            <button
              onClick={() => navigateProduct('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={() => navigateProduct('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 flex space-x-2 z-10">
          <button
            onClick={handleZoomOut}
            className="text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
          >
            <ZoomOut size={24} />
          </button>
          <button
            onClick={handleZoomIn}
            className="text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
          >
            <ZoomIn size={24} />
          </button>
        </div>

        {/* Image */}
        <div
          key={currentProduct._id}
          ref={imgRef}
          className={`max-w-full max-h-full animate-scaleIn ${
            zoomLevel > 1 ? 'cursor-move' : 'cursor-zoom-in'
          }`}
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
          onClick={handleImageClick}
          onMouseDown={handleMouseDown}
        >
          <OptimizedImage
            src={currentImage}
            alt={currentProduct.title}
            width={1600}
            height={1600}
            priority={true}
            className="max-w-full max-h-full select-none"
            objectFit="contain"
            draggable={false}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/GandharaImages/Gandharalogo.webp';
            }}
          />
        </div>

        {/* Product Counter - Only show when multiple products */}
        {allProducts.length > 1 && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
            Product {currentProductIndex + 1} of {allProducts.length}
          </div>
        )}

        {/* Navigation Dots - Only show for multiple products and when ≤10 products */}
        {allProducts.length > 1 && allProducts.length <= 10 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {allProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentProductIndex(index);
                  onProductChange(allProducts[index]);
                }}
                className={`w-2 h-2 rounded-full ${
                  index === currentProductIndex ? 'bg-white' : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
          {allProducts.length > 1 ? '← → Navigate products • ' : ''}Click to zoom • ESC to close
        </div>
      </div>
  );
};

// --- Product Detail Modal ---
const ProductDetailModal = ({ product, onClose, allProducts, onProductChange }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);

  if (!product) return null;

  const getModalImagePath = (imageName) => {
    if (typeof imageName === 'string' && imageName.trim() !== '') {
      if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
        return imageName;
      }
      return getImageUrl(imageName);
    }
    return '/GandharaImages/Gandharalogo.webp';
  };
  
  // Get all images for this product
  const productImages = [];
  if (product.images && product.images.length > 0) {
    productImages.push(...product.images.map(img => getModalImagePath(img)));
  } else if (product.image) {
    productImages.push(getModalImagePath(product.image));
  }
  
  if (productImages.length === 0) {
    productImages.push('/GandharaImages/Gandharalogo.webp');
  }

  const currentProductIndex = allProducts.findIndex(p => p._id === product._id);
  
  const navigateProduct = (direction) => {
    if (direction === 'prev') {
      const newIndex = currentProductIndex > 0 ? currentProductIndex - 1 : allProducts.length - 1;
      onProductChange(allProducts[newIndex]);
    } else {
      const newIndex = currentProductIndex < allProducts.length - 1 ? currentProductIndex + 1 : 0;
      onProductChange(allProducts[newIndex]);
    }
    setCurrentImageIndex(0); // Reset to first image when switching products
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
        onClick={onClose}
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row transform-gpu animate-scale3DIn"
          onClick={(e) => e.stopPropagation()}
          style={{ transformStyle: "preserve-3d" }}
        >
          <DecorativeBorder />
          
          {/* Product Navigation Arrows */}
          {allProducts.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateProduct('prev');
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#0F172A]/80 hover:bg-[#0F172A] backdrop-blur-sm rounded-full p-2 text-[#F1C27D] transition-all duration-200 hover-scale"
              >
                <ChevronLeft size={20} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateProduct('next');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#0F172A]/80 hover:bg-[#0F172A] backdrop-blur-sm rounded-full p-2 text-[#F1C27D] transition-all duration-200 hover-scale"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          
          <div
            className="w-full md:w-1/2 aspect-square overflow-hidden relative bg-[#334155] cursor-pointer animate-fadeInUp animation-delay-100"
            onClick={() => setShowImageViewer(true)}
          > 
            <OptimizedImage
              src={productImages[currentImageIndex]}
              alt={product.title || 'Product Image'}
              width={800}
              height={800}
              priority={true}
              className="w-full h-full transition-transform duration-300 hover:scale-105 select-none"
              objectFit="contain"
              draggable={false}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/GandharaImages/Gandharalogo.webp';
              }}
            />
            
            
            {/* Image Navigation Dots */}
            {productImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-[#F1C27D] scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Zoom Indicator */}
            <div className="absolute top-4 right-4 bg-[#0F172A]/60 backdrop-blur-sm rounded-full p-2 text-[#F1C27D]">
              <ZoomIn size={16} />
            </div>
            
            {/* Decorative corner patterns */}
            <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-[#F1C27D]/60 rounded-tl-md"></div>
            <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-[#F1C27D]/60 rounded-tr-md"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-[#F1C27D]/60 rounded-bl-md"></div>
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-[#F1C27D]/60 rounded-br-md"></div>
          </div>
          
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto text-[#F8FAFC]">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent animate-fadeInUp animation-delay-100"
            >
              {product.title || "Untitled Product"}
            </h2>
            
            {/* Product Counter */}
            {allProducts.length > 1 && (
              <div
                className="text-sm text-[#F1C27D] mb-4 animate-fadeInUp animation-delay-200"
              >
                Product {currentProductIndex + 1} of {allProducts.length}
              </div>
            )}
            
            <div
              className="text-sm text-[#E2E8F0] leading-relaxed mb-6 prose prose-sm max-w-none flex-grow animate-fadeInUp animation-delay-300"
            >
              {product.description ? (
                <p>{product.seoDescription || product.description}</p>
              ) : (
                <p>Detailed description for this beautiful product will be available soon. Stay tuned!</p>
              )}
            </div>
            
            {product.tags && product.tags.length > 0 && (
              <div
                className="mb-6 animate-fadeInUp animation-delay-400"
              >
                <h4 className="text-xs font-semibold text-[#E2E8F0] uppercase mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-[#334155] text-[#F1C27D] px-2.5 py-1 rounded-full text-xs shadow-sm animate-fadeInUp"
                      style={{ animationDelay: `${0.45 + idx * 0.05}s` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-3">
              <WhatsAppButton
                phoneNumber="+923005567507"
                productName={product.seoTitle || product.title}
                product={product}
                className="flex-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm flex items-center justify-center hover-scale animate-fadeInUp animation-delay-500"
              >
                <ShoppingBag size={18} className="mr-2" /> Order via WhatsApp
              </WhatsAppButton>
              
              <button
                onClick={onClose}
                className="flex-1 bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full text-sm flex items-center justify-center hover-scale animate-fadeInUp"
                style={{ animationDelay: "0.6s" }}
                aria-label="Close"
              >
                <X size={18} className="mr-2" /> Close
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-[#F8FAFC] hover:text-white bg-[#0F172A]/60 hover:bg-[#0F172A]/80 rounded-full p-2 transition-all z-20 hover-scale animate-scaleIn"
            style={{ animationDelay: "0.5s" }}
            aria-label="Close product details"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image Viewer Modal with Product Navigation */}
      {showImageViewer && (
        <ImageViewer
          isOpen={showImageViewer}
          onClose={() => setShowImageViewer(false)}
          allProducts={allProducts}
          currentProduct={product}
          onProductChange={(newProduct) => {
            onProductChange(newProduct);
            setCurrentImageIndex(0); // Reset image index when product changes
          }}
        />
      )}
    </>
  );
};

// Legacy inline ProductCard removed in Section 5.
// The canonical themed card lives at ../components/ProductCard.jsx
// and is imported at the top of this file.

// --- Main AllProductsPage Component ---
const AllProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use grouped products API (categories in admin-defined order)
  const {
    data: groupedData,
    isLoading,
    isError,
    error
  } = useGroupedProducts(12);

  // Flatten all groups into a single products array for search
  const allProducts = useMemo(() => {
    if (!groupedData?.groups) return [];
    return groupedData.groups.flatMap(g => g.products || []);
  }, [groupedData]);

  const total = allProducts.length;

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return null; // null = show grouped view
    return allProducts.filter(product =>
      product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  // Filter groups based on search term (for grouped view with search)
  const filteredGroups = useMemo(() => {
    if (!groupedData?.groups) return [];
    if (!searchTerm) return groupedData.groups;
    // When searching, show flat filtered results instead
    return groupedData.groups;
  }, [groupedData, searchTerm]);

  // Read search parameter from URL on mount
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  const navigate = useNavigate();

  // Memoized product click handler
  const handleProductClick = useCallback((product) => {
    if (!product) return;
    const idOrSlug = product.slug || product._id;
    if (idOrSlug) {
      navigate(`/product/${idOrSlug}`);
    }
  }, [navigate]);

  const handleProductChange = (newProduct) => {
    setSelectedProduct(newProduct);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedProduct) return;
      
      const navList = filteredProducts || allProducts;
      const currentIndex = navList.findIndex(p => p._id === selectedProduct._id);
      
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedProduct(navList[currentIndex - 1]);
      } else if (e.key === 'ArrowRight' && currentIndex < navList.length - 1) {
        setSelectedProduct(navList[currentIndex + 1]);
      } else if (e.key === 'Escape') {
        setSelectedProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, filteredProducts, allProducts]);

  const skeletonCount = 8;
  const pageTitle = "Our Exquisite Collection";
  const titleWords = pageTitle.split(" ");

  return (
    <div className="bg-gray-50 md:bg-[#0F172A] min-h-screen font-sans selection:bg-[#F1C27D] selection:text-[#0F172A] relative">
      {/* Desktop Decorative patterns */}
      <div className="hidden md:block">
        <DecorativePattern className="top-10 left-10 opacity-20 rotate-12" />
        <DecorativePattern className="bottom-20 right-10 opacity-10 -rotate-12" />
        <DecorativePattern className="top-1/3 right-1/4 opacity-5 rotate-45" />
        <DecorativePattern className="bottom-1/3 left-1/4 opacity-5 -rotate-45" />
      </div>
      
      <div className="container mx-auto max-w-screen-xl p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[
          { name: 'Home', url: '/' },
          { name: 'All Products' }
        ]} />

        {/* Mobile-optimized header */}
        <div className="md:hidden mb-6 pt-4">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Our Collection
          </h1>
          <p className="text-gray-600 text-sm text-center">
            Explore our handcrafted products
          </p>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block">
          {/* Decorative bar at top */}
          <div className="w-24 h-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] rounded-full mx-auto mb-8"></div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 sm:mb-6 text-center tracking-tight bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent">
            {titleWords.map((word, index) => (
              <span
                key={index}
                className="inline-block mr-2 sm:mr-3 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.15 + 0.1}s` }}
              >
                {word}
              </span>
            ))}
          </h1>
          
          <p
            className="text-[#E2E8F0] text-lg max-w-2xl mx-auto text-center mb-12 animate-fadeInUp animation-delay-500"
          >
            Explore our timeless artifacts and exquisite craftsmanship from Gandhara art tradition
          </p>
          
          {/* Decorative bar after heading */}
          <div className="w-24 h-1 bg-gradient-to-r from-[#F1C27D] to-[#E6A44E] rounded-full mx-auto mb-10"></div>
        </div>

        {/* Search Bar */}
        {!isLoading && !isError && allProducts.length > 0 && (
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            totalProducts={allProducts.length}
            filteredCount={filteredProducts ? filteredProducts.length : allProducts.length}
          />
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[...Array(skeletonCount)].map((_, index) => (
               <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
           <div className="text-center py-12 px-4">
              <div className="inline-block animate-fadeInUp">
                <Wind size={48} className="text-[#E6A44E] md:text-[#F1C27D] mb-4 mx-auto" />
                <p className="text-[#E6A44E] md:text-[#F1C27D] bg-white md:bg-[#1E293B] p-4 rounded-lg shadow-md">{error?.message || 'An error occurred'}</p>
              </div>
           </div>
        )}

        {!isLoading && !isError && allProducts.length === 0 && (
           <div className="text-center py-20 px-4">
             <div className="animate-scaleIn">
                <Feather size={60} className="text-[#E6A44E] md:text-[#F1C27D] mb-6 mx-auto" />
                <p className="text-gray-700 md:text-[#E2E8F0] text-xl mb-5">
                    Our gallery is currently awaiting new masterpieces.
                </p>
                <button
                    onClick={() => window.location.href='/'} 
                    className="mt-4 inline-block bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 animation-delay-300"
                >
                    Return Home
                </button>
             </div>
           </div>
        )}

        {/* Empty Search Results */}
        {!isLoading && !isError && allProducts.length > 0 && filteredProducts && filteredProducts.length === 0 && searchTerm && (
          <div className="text-center py-12 px-4 animate-fadeInUp">
            <p className="text-gray-700 md:text-[#E2E8F0] text-lg mb-6">
              No products found matching "{searchTerm}".
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Clear Search
              <X size={16} className="ml-2" />
            </button>
          </div>
        )}

        {/* Flat search results (when user is searching) */}
        {!isLoading && !isError && filteredProducts && filteredProducts.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 animate-fadeIn"
          >
            {filteredProducts.map((product, index) => (
              product && product._id ? ( 
                <ProductCard
                  key={product._id}
                  product={product}
                  onClick={handleProductClick}
                  searchTerm={searchTerm}
                  index={index}
                />
              ) : null
            ))}
          </div>
        )}

        {/* Grouped by Category (default view, no search) */}
        {!isLoading && !isError && !searchTerm && groupedData?.groups && groupedData.groups.length > 0 && (
          <div className="space-y-12">
            {groupedData.groups.map((group, groupIndex) => (
              <section key={group.category} className="animate-fadeInUp" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-[#E6A44E] to-[#F1C27D] rounded-full"></div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 md:text-[#F8FAFC]">
                      {group.category}
                    </h2>
                    <span className="text-sm text-gray-500 md:text-[#94A3B8]">
                      ({group.total} {group.total === 1 ? 'product' : 'products'})
                    </span>
                  </div>
                  {group.hasMore && (
                    <a
                      href={`/category/${encodeURIComponent(group.category.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="inline-flex items-center text-sm font-medium text-[#E6A44E] hover:text-[#F1C27D] transition-colors group"
                    >
                      View All
                      <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                  {group.products.map((product, index) => (
                    product && product._id ? (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onClick={handleProductClick}
                        searchTerm=""
                        index={groupIndex === 0 ? index : index + 99}
                      />
                    ) : null
                  ))}
                </div>

                {/* Category Divider */}
                {groupIndex < groupedData.groups.length - 1 && (
                  <div className="mt-10 flex items-center">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E6A44E]/30 to-transparent"></div>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* Total products info */}
        {!isLoading && !isError && !searchTerm && allProducts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-[#64748B]">
              Showing {allProducts.length} products across {groupedData?.groups?.length || 0} categories
            </p>
          </div>
        )}
      </div>

      {/* Desktop Background decorative gradient at bottom */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0F172A] to-transparent pointer-events-none"></div>
      
      {/* Floating scroll indicator - Desktop only */}
      <div
        className="hidden md:flex fixed bottom-8 right-1/2 transform translate-x-1/2 bg-[#1E293B] rounded-full p-3 shadow-lg z-10 cursor-pointer hover-scale animate-fadeInUp"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F1C27D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </div>

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={closeModal}
          allProducts={filteredProducts || allProducts}
          onProductChange={handleProductChange}
        />
      )}
    </div>
  );
};

export default AllProductsPage;
