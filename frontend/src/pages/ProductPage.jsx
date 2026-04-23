import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/animations.css';
import { ShoppingBag, ArrowRight, Eye, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Search, ImageOff } from "lucide-react";
import SEOHead from '../components/SEOHead';
import { getImageUrl } from '../utils/imageHelper';
import Breadcrumbs from '../components/Breadcrumbs';
import OptimizedImage from '../components/OptimizedImage';
import { useInfiniteProductsByCategory } from '../hooks/useApi';
// Canonical themed product card (Section 5 — replaces the old inline card).
import ProductCard from '../components/ProductCard';
import { buildProductWhatsAppUrl } from '../utils/whatsappHelper';

// Function to format category name for API calls
const formatCategoryForAPI = (categoryName) => {
  if (!categoryName) return "";
  return categoryName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Function to format category name for display
const formatCategoryName = (name) => {
  if (!name) return "";
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Helper function to get image path - FIXED FOR DEVELOPMENT
const getImagePath = (imageName) => {
  return getImageUrl(imageName);
};

// Simple Image Component with Fallback and ALWAYS-ON Watermark
const SimpleImage = ({ src, alt, className, onLoad, onError }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  
  const handleError = () => {
    console.error('Image failed to load:', src);
    setHasError(true);
    setImgSrc('/GandharaImages/Gandharalogo.webp');
    if (onError) onError();
  };
  
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);
  
  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#334155]`}>
        <div className="text-center">
          <ImageOff size={40} className="mx-auto mb-2 text-[#64748B]" />
          <p className="text-xs text-[#64748B]">Image not available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <OptimizedImage
        src={imgSrc}
        alt={alt}
        className={className}
        onLoad={onLoad}
        onError={handleError}
        width={800}
        height={800}
        objectFit="contain"
        lazy={true}
      />
      {/* PERMANENT Watermark on ALL Images */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left Logo */}
        <div className="absolute top-2 left-2 z-10">
          <img 
            src="/GandharaImages/Gandharalogo.webp" 
            alt="Gandhara Arts Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 opacity-70 drop-shadow-lg"
            onError={(e) => {
              // Fallback if logo not found - show text logo
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          {/* Text fallback logo if image not found */}
          <div className="hidden bg-white/80 text-[#0F172A] text-[8px] sm:text-[10px] font-bold px-1 py-0.5 rounded text-center leading-tight">
            <p>GA</p>
            <p>TC</p>
          </div>
        </div>
        {/* Bottom Right Watermark */}
        <div className="absolute bottom-2 right-2 text-white/70 text-[8px] sm:text-[10px] font-medium leading-tight text-right z-10">
          <p className="drop-shadow-lg shadow-black/80">Gandhara Arts and Taxila Stone Crafts.com</p>
          <p className="drop-shadow-lg shadow-black/80">+92 300 5567507</p>
        </div>
        {/* Center Diagonal Watermark */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 text-white/70 text-sm sm:text-lg font-bold text-center select-none z-10 whitespace-nowrap">
            Gandhara Arts and Taxila Stone Crafts.com | +92 300 5567507
        </div>
      </div>
    </div>
  );
};

// Skeleton Loader Component
const ProductCardSkeleton = () => (
  <div className="bg-[#1E293B] rounded-xl shadow-md overflow-hidden animate-pulse aspect-[3/4]">
    <div className="w-full h-3/4 bg-[#334155]"></div>
    <div className="p-2 sm:p-4 space-y-2">
      <div className="h-3 sm:h-4 bg-[#334155] rounded w-3/4"></div>
      <div className="h-2 sm:h-3 bg-[#334155] rounded w-1/2"></div>
    </div>
  </div>
);

// Search Component
const SearchBar = ({ searchTerm, onSearchChange, totalProducts, filteredCount }) => {
  return (
    <div className="max-w-md mx-auto mb-6 sm:mb-8 px-2 sm:px-0 animate-fadeIn animation-delay-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-[#F1C27D]" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#1E293B] border border-[#334155] rounded-xl text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#F1C27D] focus:border-transparent transition-all duration-300 text-sm sm:text-base"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#F1C27D] transition-colors duration-200 animate-scaleIn"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {searchTerm && (
        <div className="mt-2 sm:mt-3 text-center text-xs sm:text-sm text-[#E2E8F0] px-2 animate-fadeInUp animation-delay-2">
          {filteredCount === 0 ? (
            <span className="text-[#F1C27D]">No products found matching "{searchTerm}"</span>
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

// WhatsApp Button Component (prefills product page + image URLs when `product` is passed)
const WhatsAppButton = ({ phoneNumber = "+92 300 5567507", productName, productId, productUrl, product, className, children, ...props }) => {
  const cleanPhoneNumber = phoneNumber.replace(/\s+/g, "").replace("+", "");
  const whatsappLink = product
    ? buildProductWhatsAppUrl(product, cleanPhoneNumber)
    : (() => {
        const productLink = productUrl || `${window.location.origin}/product/${productId}`;
        const message = `Hello, I'm interested in your product: ${productName}\n\nProduct Link: ${productLink}`;
        return `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`;
      })();
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover-scale`}
      aria-label={`Order ${productName} on WhatsApp`}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </a>
  );
};

// Image Viewer Component
const ImageViewer = ({ images, currentImageIndex, onClose, productTitle }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const currentImage = images[currentImageIndex];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fadeIn" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <OptimizedImage
          src={currentImage}
          alt={`${productTitle} - Full View`}
          className={`max-w-full max-h-[85vh] object-contain cursor-${isZoomed ? 'zoom-out' : 'zoom-in'} select-none`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/GandharaImages/Gandharalogo.webp';
          }}
          width={1200}
          height={1200}
          objectFit="contain"
          lazy={false}
          priority={true}
        />
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 text-white hover-scale"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

// Product Detail Modal - With Navigation Arrows
const ProductDetailModal = ({ product, onClose, allProducts, onProductChange }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);

  if (!product) return null;

  // Find current product index in the array
  const currentProductIndex = allProducts.findIndex(p => p._id === product._id);
  
  // Navigation functions
  const goToPreviousProduct = () => {
    if (currentProductIndex > 0) {
      onProductChange(allProducts[currentProductIndex - 1]);
      setCurrentImageIndex(0); // Reset image index for new product
    }
  };
  
  const goToNextProduct = () => {
    if (currentProductIndex < allProducts.length - 1) {
      onProductChange(allProducts[currentProductIndex + 1]);
      setCurrentImageIndex(0); // Reset image index for new product
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') goToPreviousProduct();
      if (e.key === 'ArrowRight') goToNextProduct();
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentProductIndex, allProducts]);

  // Get all images for this product
  const productImages = [];
  if (product.images && product.images.length > 0) {
    productImages.push(...product.images.map(img => getImagePath(img)));
  } else if (product.image) {
    productImages.push(getImagePath(product.image));
  }
  
  if (productImages.length === 0) {
    productImages.push('/GandharaImages/Gandharalogo.webp');
  }

  return (
    <>
      <div className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={onClose}>
        <div className="relative bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-scaleIn" onClick={(e) => e.stopPropagation()}>
          {/* Left Arrow - Previous Product */}
          {currentProductIndex > 0 && (
            <button
              onClick={goToPreviousProduct}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 text-white hover-scale"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Right Arrow - Next Product */}
          {currentProductIndex < allProducts.length - 1 && (
            <button
              onClick={goToNextProduct}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 text-white hover-scale"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Product Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
            {currentProductIndex + 1} of {allProducts.length}
          </div>

          {/* Image Section */}
          <div className="w-full md:w-1/2 bg-[#0F172A] relative cursor-pointer" onClick={() => setShowImageViewer(true)}>
            <OptimizedImage
              src={productImages[currentImageIndex]}
              alt={product.imageAlt || product.title || 'Product Image'}
              className="w-full h-64 md:h-full object-contain select-none"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/GandharaImages/Gandharalogo.webp';
              }}
              width={800}
              height={800}
              objectFit="contain"
              lazy={false}
              priority={true}
            />
            
            {productImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-[#F1C27D] scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="w-full md:w-1/2 p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-[#F1C27D]">
              {product.seoTitle || product.title || "Untitled Product"}
            </h2>
            
            <p className="text-[#E2E8F0] mb-6 flex-grow">
              {product.seoDescription || product.description || "Beautiful handcrafted piece from Gandhara collection."}
              
            </p>
            
            {product.categories && product.categories.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category, idx) => (
                    <span key={idx} className="bg-[#334155] text-[#F1C27D] px-3 py-1 rounded-full text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <WhatsAppButton
                phoneNumber="+92 300 5567507"
                productName={product.seoTitle || product.title}
                productId={product._id}
                productUrl={`${window.location.origin}/product/${product.slug || product._id}`}
                product={product}
                className="flex-1 bg-[#F1C27D] hover:bg-[#E6A44E] text-[#0F172A] font-semibold py-3 px-4 rounded-lg flex items-center justify-center"
              >
                <ShoppingBag size={18} className="mr-2" />
                Order via WhatsApp
              </WhatsAppButton>
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-[#F1C27D] z-20"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {showImageViewer && (
        <ImageViewer
          images={productImages}
          currentImageIndex={currentImageIndex}
          onClose={() => setShowImageViewer(false)}
          productTitle={product.seoTitle || product.title}
        />
      )}
    </>
  );
};

// Legacy inline ProductCard removed in Section 5.
// The canonical themed card lives at ../components/ProductCard.jsx
// and is imported at the top of this file.

// Main ProductPage Component
const ProductPage = () => {
  const { categoryName } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 20;

  const formattedTitle = formatCategoryName(categoryName);
  const apiCategoryName = formatCategoryForAPI(categoryName);

  // Reset state and scroll to top when category changes
  useEffect(() => {
    setSearchTerm('');
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  }, [categoryName]);

  // Use React Query infinite scroll — data cached per category
  const {
    data,
    isLoading: loading,
    isError,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage: loadingMore,
  } = useInfiniteProductsByCategory(apiCategoryName, ITEMS_PER_PAGE);

  // Show loading skeleton while fetching initial data for a new category
  const isInitialLoading = loading && !data;

  // Flatten all pages of products into a single array
  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => {
      const items = page?.products || page || [];
      return Array.isArray(items) ? items : [];
    });
  }, [data]);

  const total = products.length;
  const error = isError ? (queryError?.message || 'Failed to load products. Please try again later.') : null;

  // Filter products based on search term
  const filteredProducts = useMemo(() =>
    products.filter(product =>
      product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]
  );

  // Load more products
  const loadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      fetchNextPage();
    }
  }, [loadingMore, hasNextPage, fetchNextPage]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const navigate = useNavigate();

  // Navigate to product detail page
  const handleProductClick = (product) => {
    if (!product) return;
    const idOrSlug = product.slug || product._id;
    if (idOrSlug) {
      navigate(`/product/${idOrSlug}`);
    }
  };

  return (
    <>
      <SEOHead 
        title={`${formattedTitle || 'Premium Pakistani Stone Crafts'} - Gandhara Arts Collection`}
        description={`Explore authentic ${formattedTitle?.toLowerCase() || 'Pakistani stone crafts'} from Gandhara Arts. Handcrafted Buddha statues, sculptures, and heritage pieces from Taxila, Pakistan.`}
        keywords={`${formattedTitle?.toLowerCase() || 'pakistani stone crafts'}, gandhara arts, taxila sculptures, buddha statues, ${categoryName ? categoryName.replace(/-/g, ' ') : 'heritage crafts'}, pakistani art, stone carvings`}
        canonicalUrl={`https://gandhara-arts-and-taxila-stone-crafts.com/products/${categoryName || ''}`}
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${formattedTitle || 'Pakistani Stone Crafts'} Collection`,
          "description": `Authentic ${formattedTitle?.toLowerCase() || 'Pakistani stone crafts'} handcrafted by artisans in Taxila, Pakistan`,
          "url": `https://gandhara-arts-and-taxila-stone-crafts.com/products/${categoryName || ''}`,
          "provider": {
            "@type": "Organization",
            "name": "Gandhara Arts",
            "url": "https://gandhara-arts-and-taxila-stone-crafts.com"
          },
          "numberOfItems": products.length,
          "hasPart": products.slice(0, 5).map(product => ({
            "@type": "Product",
            "name": product.name,
            "description": product.shortDescription || product.seoDescription || product.description,
            "image": `https://gandhara-arts-and-taxila-stone-crafts.com${getImagePath(product.images?.[0])}`,
            "url": `https://gandhara-arts-and-taxila-stone-crafts.com/product/${product.slug || product._id}`,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          }))
        }}
      />
      
      <div className="bg-[#0F172A] min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: formattedTitle || categoryName }
        ]} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#F1C27D]">
            {loading ? 'Loading...' : formattedTitle || 'Products'}
          </h1>
          <p className="text-[#E2E8F0]">
            Explore our collection of handcrafted pieces
          </p>
        </div>

        {/* Search Bar */}
        {!loading && !error && products.length > 0 && (
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalProducts={products.length}
            filteredCount={filteredProducts.length}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-[#F1C27D] text-lg mb-4">{error}</p>
            <Link 
              to="/products" 
              className="inline-flex items-center px-6 py-3 bg-[#F1C27D] hover:bg-[#E6A44E] text-[#0F172A] font-semibold rounded-lg"
            >
              View All Products
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#E2E8F0] text-lg mb-4">
              {searchTerm 
                ? `No products found matching "${searchTerm}"`
                : "No products found in this category"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-6 py-3 bg-[#F1C27D] hover:bg-[#E6A44E] text-[#0F172A] font-semibold rounded-lg"
              >
                Clear Search
                <X size={16} className="ml-2" />
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product, index) => (
              <ProductCard
                key={product._id || index}
                product={product}
                index={index}
                onClick={handleProductClick}
              />
            ))}
          </div>
        )}

        {/* Load More Button and Status */}
        {!loading && !error && (
          <div className="text-center py-8">
            {loadingMore && (
              <div className="flex items-center justify-center space-x-2 text-[#64748B]">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading more products...</span>
              </div>
            )}
            
            {!loadingMore && hasNextPage && (
              <button
                onClick={loadMore}
                className="bg-[#1E293B] hover:bg-[#334155] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Load More Products
              </button>
            )}
            
            {!hasNextPage && products.length > 0 && (
              <p className="text-[#64748B]">All products loaded ({total} total)</p>
            )}
          </div>
        )}

        {/* Product count */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="text-center mt-8 text-sm text-[#94A3B8]">
            Showing {filteredProducts.length} products
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          allProducts={filteredProducts}
          onProductChange={setSelectedProduct}
        />
      )}
      </div>
    </>
  );
};

export default ProductPage;
