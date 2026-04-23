import { useParams, Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageHelper.js";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ShoppingBag, ArrowRight, Eye, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Search } from "lucide-react";
import SEOHead from '../components/SEOHead';
import OptimizedImage from '../components/OptimizedImage';
import '../styles/animations.css';

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

// Skeleton Loader Component
const ProductCardSkeleton = () => (
  <div className="bg-[#1E293B] rounded-xl shadow-md overflow-hidden animate-pulse aspect-[3/4]">
    <div className="w-full h-full bg-[#334155]"></div>
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0F172A] to-transparent h-24"></div>
  </div>
);

// Function to format category name (replace hyphens, capitalize)
const formatCategoryName = (name) => {
  if (!name) return "";
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

// --- Search Component ---
const SearchBar = ({ searchTerm, onSearchChange, totalProducts, filteredCount }) => {
  return (
    <div className="max-w-md mx-auto mb-8 animate-fadeIn">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-[#F1C27D]" />
        </div>
        <input
          type="text"
          placeholder="Search products by title..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#1E293B] border border-[#334155] rounded-xl text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#F1C27D] focus:border-transparent transition-all duration-300"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#F1C27D] transition-colors duration-200 animate-fadeIn"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {/* Search Results Info */}
      {searchTerm && (
        <div className="mt-3 text-center text-sm text-[#E2E8F0] animate-fadeIn">
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

// --- Enhanced Image Viewer Component ---
const ImageViewer = ({ images, currentImageIndex, onImageChange, onClose, productTitle }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);

  const handleImageClick = (e) => {
    if (!isZoomed) {
      setIsZoomed(true);
      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    } else {
      setIsZoomed(false);
    }
  };

  const handleMouseMove = (e) => {
    if (isZoomed && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    }
  };

  const navigateImage = (direction) => {
    if (images.length <= 1) return;
    
    if (direction === 'prev') {
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
      onImageChange(newIndex);
    } else {
      const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
      onImageChange(newIndex);
    }
    setIsZoomed(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only allow navigation if current product has multiple images
      if (images.length <= 1) {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateImage('next');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImageIndex, images.length]);

  const currentImage = images[currentImageIndex];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60] animate-fadeIn"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Navigation Arrows - Only show if the current product has multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-200 hover-scale"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-200 hover-scale"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Main Image */}
        <div className="relative max-w-[90vw] max-h-[90vh] overflow-hidden">
          <img
            key={currentImageIndex} // Add key to trigger re-animation on image change
            ref={imageRef}
            src={currentImage}
            alt={`${productTitle} - Image ${currentImageIndex + 1}`}
            className={`max-w-full max-h-full object-contain cursor-${isZoomed ? 'zoom-out' : 'zoom-in'} transition-transform duration-300 animate-fadeIn`}
            style={{
              transform: isZoomed ? `scale(2.5)` : 'scale(1)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
            }}
            onClick={handleImageClick}
            onMouseMove={handleMouseMove}
            onError={(e) => { e.target.onerror = null; e.target.src='/GandharaImages/Gandharalogo.webp'; }}
            loading="lazy"
          />
        </div>

        {/* Image Counter - Only show if the current product has multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Image Navigation Dots - Only show if the current product has multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onImageChange(index);
                  setIsZoomed(false);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Zoom Indicator */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white">
          {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 text-white transition-all duration-200 hover-scale"
        >
          <X size={24} />
        </button>

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
          {images.length > 1 && <div className="mb-1">← → Navigate images</div>}
          <div>Click to {isZoomed ? 'zoom out' : 'zoom in'}</div>
        </div>
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
          className="relative bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row transform-gpu animate-scaleIn"
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
            className="w-full md:w-1/2 aspect-square overflow-hidden relative bg-[#334155] cursor-pointer animate-fadeInUp"
            onClick={() => setShowImageViewer(true)}
          >
            <OptimizedImage
              src={productImages[currentImageIndex]}
              alt={product.title || 'Product Image'}
              className="w-full h-full object-contain object-center transition-transform duration-300 hover:scale-105"
              loading="lazy"
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
              className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent animate-fadeInUp"
            >
              {product.title || "Untitled Product"}
            </h2>
            
            {/* Product Counter */}
            {allProducts.length > 1 && (
              <div
                className="text-sm text-[#F1C27D] mb-4 animate-fadeInUp"
              >
                Product {currentProductIndex + 1} of {allProducts.length}
              </div>
            )}
            
            <div
              className="text-sm text-[#E2E8F0] leading-relaxed mb-6 prose prose-sm max-w-none flex-grow animate-fadeInUp"
            >
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p>Detailed description for this beautiful product will be available soon. Stay tuned!</p>
              )}
            </div>
            
            {product.tags && product.tags.length > 0 && (
              <div
                className="mb-6 animate-fadeInUp"
              >
                <h4 className="text-xs font-semibold text-[#E2E8F0] uppercase mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-[#334155] text-[#F1C27D] px-2.5 py-1 rounded-full text-xs shadow-sm animate-fadeIn"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-3">
              <WhatsAppButton
                phoneNumber="+92 300 5567507"
                productName={product.title}
                productId={product._id}
                className="flex-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm flex items-center justify-center hover-scale animate-fadeInUp"
              >
                <ShoppingBag size={18} className="mr-2" /> Order via WhatsApp
              </WhatsAppButton>
              
              <button
                onClick={onClose}
                className="flex-1 bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full text-sm flex items-center justify-center hover-scale animate-fadeInUp"
                aria-label="Close"
              >
                <X size={18} className="mr-2" /> Close
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-[#F8FAFC] hover:text-white bg-[#0F172A]/60 hover:bg-[#0F172A]/80 rounded-full p-2 transition-all z-20 hover-scale animate-fadeIn"
            aria-label="Close product details"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <ImageViewer
          images={productImages}
          currentImageIndex={currentImageIndex}
          onImageChange={setCurrentImageIndex}
          onClose={() => setShowImageViewer(false)}
          productTitle={product.title}
        />
      )}
    </>
  );
};

// Enhanced WhatsApp Button Component
const WhatsAppButton = ({ phoneNumber, productName, productId, className, children, ...props }) => {
  const message = `Hello, I'm interested in your product: ${productName} (ID: ${productId})`;
  const encodedMessage = encodeURIComponent(message);
  const cleanPhoneNumber = phoneNumber.replace(/\s+/g, "").replace("+", "");
  const whatsappLink = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Order ${productName} on WhatsApp`}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </a>
  );
};

// ProductCard Component
const ProductCard = ({ product, index, onClick, searchTerm }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

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

  const primaryImageSrc = product.images && product.images.length > 0 && product.images[0]
    ? getImagePath(product.images[0])
    : getImagePath(product.image); 

  const secondaryImageSrc = product.images && product.images.length > 1 && product.images[1]
    ? getImagePath(product.images[1])
    : primaryImageSrc; 

  const currentImageSrc = isHovered ? secondaryImageSrc : primaryImageSrc;

  // Highlight search term in title
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-[#F1C27D] text-[#0F172A] px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  // Handle 3D tilt
  const MAX_TILT = 10; // Maximum tilt in degrees
  
  const handleMouseMove = (e) => {
    if (!cardRef.current || !isHovered) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate tilt angles - percentage across element converted to tilt angle
    const tiltX = (mouseY / (rect.height / 2)) * -MAX_TILT;
    const tiltY = (mouseX / (rect.width / 2)) * MAX_TILT;
    
    // Apply the transform using CSS variables
    cardRef.current.style.setProperty('--tilt-x', `${tiltX}deg`);
    cardRef.current.style.setProperty('--tilt-y', `${tiltY}deg`);
  };
  
  const resetTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--tilt-x', '0deg');
    cardRef.current.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div
      ref={cardRef}
      className="group relative aspect-[3/4] bg-[#1E293B] rounded-xl shadow-xl hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 animate-fadeInUp hover-scale"
      onClick={() => onClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        resetTilt();
      }}
      onMouseMove={handleMouseMove}
      style={{ 
        transformStyle: "preserve-3d",
        transform: "perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
      }}
    >
      {/* Shine effect div */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-tr from-transparent via-white to-transparent z-10 transition-opacity duration-700 ease-out"
        style={{
          backgroundSize: "200% 200%",
          backgroundPosition: isHovered ? "100% 100%" : "0% 0%",
          transition: "background-position 0.7s ease-out, opacity 0.3s ease-out"
        }}
      />

      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <OptimizedImage
          key={currentImageSrc} 
          src={currentImageSrc}
          alt={product.title || 'Product Image'}
          className="w-full h-full object-cover object-center smooth-transition"
          loading="lazy"
          style={{ transformOrigin: "center center" }}
        />
      </div>

      {/* Small decorative corner elements */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#F1C27D]/50 rounded-tl transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-[#F1C27D]"></div>
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#F1C27D]/50 rounded-tr transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-[#F1C27D]"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#F1C27D]/50 rounded-bl transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-[#F1C27D]"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#F1C27D]/50 rounded-br transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-[#F1C27D]"></div>

      {/* Always visible product info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/80 to-transparent text-white">
        <h2 className="text-base sm:text-lg font-semibold mb-2 truncate text-[#F8FAFC] group-hover:text-[#F1C27D] transition-colors duration-300">
          {highlightSearchTerm(product.title || "Untitled Product", searchTerm)}
        </h2>

        {/* Hover-specific content */}
        <div
          className={`overflow-hidden transition-all duration-400 ${isHovered ? 'opacity-100 h-auto' : 'opacity-0 h-0'}`}
        >
          <div className="space-y-2">
            <div 
              className="flex items-center text-xs sm:text-sm text-[#E2E8F0] group-hover:text-white"
            >
              View Details
              <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-0.5 transition-transform duration-200" />
            </div>
            
            <div
              className="z-40"
            >
              <WhatsAppButton
                phoneNumber="923269475516"
                productName={product.title}
                productId={product._id}
                className="w-full bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] text-[11px] sm:text-xs font-semibold py-1.5 sm:py-2 px-2 rounded-md shadow hover:shadow-md transition-all duration-200 flex items-center justify-center z-40 hover-scale"
              >
                <ShoppingBag size={12} className="mr-1.5" /> Order Now
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>
      
      {isHovered && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 sm:p-3.5 bg-[#F1C27D]/20 backdrop-blur-sm rounded-full pointer-events-none z-20 animate-fadeIn"
        >
          <Eye size={26} className="text-[#F8FAFC]" />
        </div>
      )}
    </div>
  );
};

// Main Component
const ProductPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 20;

  const formattedTitle = formatCategoryName(categoryName);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchProducts();
  }, [categoryName, formattedTitle]);

  const fetchProducts = async (pageNum = 1, resetProducts = true) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/api/products/category/${encodeURIComponent(categoryName.replace(/-/g, " ").replace(/\b\w/g, function(c){return c.toUpperCase();}))}?page=${pageNum}&limit=${ITEMS_PER_PAGE}`
      );
      
      const productData = response.data?.products || response.data || [];
      const sortedProducts = Array.isArray(productData) ? productData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ) : [];
      
      if (resetProducts || pageNum === 1) {
        setProducts(sortedProducts);
      } else {
        setProducts(prev => [...prev, ...sortedProducts]);
      }
      
      setTotal(response.data?.total || sortedProducts.length);
      setHasMore((sortedProducts?.length || 0) === ITEMS_PER_PAGE && (sortedProducts?.length || 0) > 0);
      setPage(pageNum);
    } catch (err) {
      console.error(`Error fetching products for category ${categoryName}:`, err);
      if (err.response?.status === 404) {
        setError(`No products found for the category "${formattedTitle}".`);
      } else {
        setError("Failed to load products. Please check the category or try again later.");
      }
      if (pageNum === 1) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more products
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1, false);
    }
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, page]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

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
      
      const currentIndex = filteredProducts.findIndex(p => p._id === selectedProduct._id);
      
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedProduct(filteredProducts[currentIndex - 1]);
      } else if (e.key === 'ArrowRight' && currentIndex < filteredProducts.length - 1) {
        setSelectedProduct(filteredProducts[currentIndex + 1]);
      } else if (e.key === 'Escape') {
        setSelectedProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, filteredProducts]);

  const skeletonCount = 8;

  // Stagger container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  return (
    <>
      <SEOHead 
        title="Visit Taxila Heritage Sites - Gandhara Arts Cultural Tours"
        description="Explore Taxila's ancient heritage sites and visit Gandhara Arts gallery. Discover Buddha statues, archaeological museums, and authentic Pakistani stone crafts in historic Taxila, Pakistan."
        keywords="visit taxila, taxila heritage sites, gandhara arts gallery, taxila museum, buddha statues taxila, pakistani heritage tourism, taxila archaeological sites, gandhara civilization, buddhist heritage pakistan"
        canonicalUrl="https://gandhara-arts-and-taxila-stone-crafts.com/visit-taxila"
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          "name": "Taxila Heritage Sites & Gandhara Arts Gallery",
          "description": "Historic Taxila city featuring ancient Gandhara civilization sites and modern stone craft gallery",
          "image": "https://gandhara-arts-and-taxila-stone-crafts.com/images/taxila-heritage.jpg",
          "url": "https://gandhara-arts-and-taxila-stone-crafts.com/visit-taxila",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Taxila",
            "@region": "Punjab",
            "addressCountry": "Pakistan"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "33.7406",
            "longitude": "72.8027"
          },
          "touristType": ["Cultural Tourism", "Heritage Tourism", "Educational Tourism"],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Gandhara Arts Collection",
            "itemListElement": products.slice(0, 5).map(product => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": product.name,
                "description": product.shortDescription || product.description,
                "image": `https://gandhara-arts-and-taxila-stone-crafts.com${getImageUrl(product.images?.[0])}`
              }
            }))
          }
        }}
      />
      
      <div className="bg-[#0F172A] min-h-screen font-sans selection:bg-[#F1C27D] selection:text-[#0F172A] relative">
      {/* Decorative patterns */}
      <DecorativePattern className="top-10 left-10 opacity-20 rotate-12" />
      <DecorativePattern className="bottom-20 right-10 opacity-10 -rotate-12" />
      <DecorativePattern className="top-1/3 right-1/4 opacity-5 rotate-45" />
      
      <div className="container mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8 relative z-10">
        {/* Page heading with decorative elements */}
        <div className="text-center mb-12">
          <div
            className="inline-block mb-4 animate-fadeIn"
          >
            <div className="w-20 h-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] rounded-full mx-auto"></div>
          </div>
          
          <h1
            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent animate-fadeInUp"
          >
            {loading ? 'Loading Category...' : formattedTitle || 'Products'}
          </h1>
          
          <p
            className="text-lg text-[#E2E8F0] max-w-3xl mx-auto animate-fadeInUp"
          >
            Explore our exquisite collection of handcrafted {formattedTitle} pieces from Gandhara
          </p>
          
          <div
            className="mt-6 animate-fadeIn"
          >
            <div className="w-20 h-1 bg-gradient-to-r from-[#F1C27D] to-[#E6A44E] rounded-full mx-auto"></div>
          </div>
        </div>

        {/* Search Bar */}
        {!loading && !error && products.length > 0 && (
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            totalProducts={products.length}
            filteredCount={filteredProducts.length}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(skeletonCount)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div 
            className="text-center py-12 px-4 animate-fadeInUp"
          >
            <p className="text-[#F1C27D] bg-[#1E293B] p-6 rounded-xl shadow-lg inline-block mb-6">
              {error}
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover-scale"
            >
              View All Products
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        )}

        {/* Empty State - No Products */}
        {!loading && !error && products.length === 0 && (
          <div 
            className="text-center py-12 px-4 animate-fadeInUp"
          >
            <p className="text-[#E2E8F0] text-lg mb-6">
              No products found in the "{formattedTitle}" category.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              View All Products
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        )}

        {/* Empty Search Results */}
        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && searchTerm && (
          <div 
            className="text-center py-12 px-4 animate-fadeInUp"
          >
            <p className="text-[#E2E8F0] text-lg mb-6">
              No products found matching "{searchTerm}" in {formattedTitle}.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover-scale"
            >
              Clear Search
              <X size={16} className="ml-2" />
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                onClick={handleProductClick}
                searchTerm={searchTerm}
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
            
            {!loadingMore && hasMore && (
              <button
                onClick={loadMore}
                className="bg-[#1E293B] hover:bg-[#334155] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Load More Products
              </button>
            )}
            
            {!hasMore && products.length > 0 && (
              <p className="text-[#64748B]">All products loaded ({total} total)</p>
            )}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={closeModal}
          allProducts={filteredProducts}
          onProductChange={handleProductChange}
        />
      )}
      </div>
    </>
  );
};

export default ProductPage;
