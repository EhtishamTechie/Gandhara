import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Eye, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Search } from "lucide-react";
import WatermarkedImage from '../components/WatermarkedImage';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

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

// Skeleton Loader Component - Enhanced for mobile
const ProductCardSkeleton = () => (
  <div className="bg-[#1E293B] rounded-xl shadow-md overflow-hidden animate-pulse aspect-[3/4]">
    <div className="w-full h-3/4 bg-[#334155]"></div>
    <div className="p-2 sm:p-4 space-y-2">
      <div className="h-3 sm:h-4 bg-[#334155] rounded w-3/4"></div>
      <div className="h-2 sm:h-3 bg-[#334155] rounded w-1/2"></div>
    </div>
  </div>
);

// Function to format category name (replace hyphens, capitalize)
const formatCategoryName = (name) => {
  if (!name) return "";
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// --- Enhanced Search Component for Mobile ---
const SearchBar = ({ searchTerm, onSearchChange, totalProducts, filteredCount }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="max-w-md mx-auto mb-6 sm:mb-8 px-2 sm:px-0"
    >
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
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#F1C27D] transition-colors duration-200"
          >
            <X size={16} />
          </motion.button>
        )}
      </div>
      
      {/* Search Results Info */}
      {searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 sm:mt-3 text-center text-xs sm:text-sm text-[#E2E8F0] px-2"
        >
          {filteredCount === 0 ? (
            <span className="text-[#F1C27D]">No products found matching "{searchTerm}"</span>
          ) : (
            <span>
              Showing {filteredCount} of {totalProducts} products
              {filteredCount !== totalProducts && ` matching "${searchTerm}"`}
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// --- Enhanced Image Viewer Component ---
const ImageViewer = ({ images, currentImageIndex, onImageChange, onClose, productTitle, allProducts, currentProduct, onProductChange }) => {
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

  const navigateProduct = (direction) => {
    if (!allProducts || allProducts.length <= 1) return;
    
    const currentProductIndex = allProducts.findIndex(p => p._id === currentProduct._id);
    
    if (direction === 'prev') {
      const newIndex = currentProductIndex > 0 ? currentProductIndex - 1 : allProducts.length - 1;
      onProductChange(allProducts[newIndex]);
    } else {
      const newIndex = currentProductIndex < allProducts.length - 1 ? currentProductIndex + 1 : 0;
      onProductChange(allProducts[newIndex]);
    }
    setIsZoomed(false);
  };

  // Keyboard navigation for products
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateProduct('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateProduct('next');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProduct, allProducts]);

  const currentImage = images[currentImageIndex];
  const currentProductIndex = allProducts ? allProducts.findIndex(p => p._id === currentProduct._id) : -1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Navigation Arrows - Show when there are multiple products */}
        {allProducts && allProducts.length > 1 && (
          <>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                navigateProduct('prev');
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 text-white transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={20} className="sm:hidden" />
              <ChevronLeft size={24} className="hidden sm:block" />
            </motion.button>
            
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                navigateProduct('next');
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 text-white transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={20} className="sm:hidden" />
              <ChevronRight size={24} className="hidden sm:block" />
            </motion.button>
          </>
        )}

        {/* Main Image */}
        <div className="relative max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] overflow-hidden">
          <motion.div
            key={`${currentProduct._id}-${currentImageIndex}`}
            ref={imageRef}
            className={`max-w-full max-h-full cursor-${isZoomed ? 'zoom-out' : 'zoom-in'} transition-transform duration-300`}
            style={{
              transform: isZoomed ? `scale(2.5)` : 'scale(1)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
            }}
            onClick={handleImageClick}
            onMouseMove={handleMouseMove}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <WatermarkedImage
              src={currentImage}
              alt={`${productTitle} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              watermarkOpacity={0.3}
              showLogo={true}
              showWhatsApp={true}
            />
          </motion.div>
        </div>

        {/* Product Counter - Show when there are multiple products */}
        {allProducts && allProducts.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-white text-xs sm:text-sm">
            Product {currentProductIndex + 1} of {allProducts.length}
          </div>
        )}

        {/* Product Navigation Dots - Show when there are multiple products */}
        {allProducts && allProducts.length > 1 && allProducts.length <= 10 && (
          <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
            {allProducts.map((product, index) => (
              <button
                key={product._id}
                onClick={(e) => {
                  e.stopPropagation();
                  onProductChange(product);
                  setIsZoomed(false);
                }}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                  index === currentProductIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Zoom Indicator */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/50 backdrop-blur-sm rounded-full p-1.5 sm:p-2 text-white">
          {isZoomed ? <ZoomOut size={16} className="sm:hidden" /> : <ZoomIn size={16} className="sm:hidden" />}
          {isZoomed ? <ZoomOut size={20} className="hidden sm:block" /> : <ZoomIn size={20} className="hidden sm:block" />}
        </div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-1.5 sm:p-2 text-white transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={20} className="sm:hidden" />
          <X size={24} className="hidden sm:block" />
        </motion.button>

        {/* Instructions */}
        <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/50 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-white text-[10px] sm:text-xs">
          {allProducts && allProducts.length > 1 && <div className="mb-1 hidden sm:block">← → Navigate products</div>}
          <div>Tap to {isZoomed ? 'zoom out' : 'zoom in'}</div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Product Detail Modal ---
const ProductDetailModal = ({ product, onClose, allProducts, onProductChange }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);

  if (!product) return null;

  const modalContentVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: 0.35 + i * 0.1, duration: 0.5, ease: "easeOut" }, 
    }),
  };

  const getModalImagePath = (imageName) => {
    if (typeof imageName === 'string' && imageName.trim() !== '') {
      if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
        return imageName;
      }
      return `${API_BASE_URL}/${imageName.startsWith('/') ? imageName.substring(1) : imageName}`;
    }
    return '/placeholder-image.png';
  };
  
  // Get all images for this product
  const productImages = [];
  if (product.images && product.images.length > 0) {
    productImages.push(...product.images.map(img => getModalImagePath(img)));
  } else if (product.image) {
    productImages.push(getModalImagePath(product.image));
  }
  
  if (productImages.length === 0) {
    productImages.push('/placeholder-image.png');
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
    setCurrentImageIndex(0);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50"
        onClick={onClose}
        style={{ perspective: "1200px" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.75, rotateY: -15 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            rotateY: 0,
            transition: { 
              type: "spring", 
              stiffness: 160, 
              damping: 20, 
              duration: 0.6,
              opacity: { duration: 0.3 }
            } 
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.75, 
            rotateY: 15,
            transition: { 
              type: "spring", 
              stiffness: 160, 
              damping: 20, 
              duration: 0.4,
              opacity: { duration: 0.25 }
            } 
          }}
          className="relative bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col md:flex-row transform-gpu"
          onClick={(e) => e.stopPropagation()}
          style={{ transformStyle: "preserve-3d" }}
        >
          <DecorativeBorder />
          
          {/* Product Navigation Arrows */}
          {allProducts.length > 1 && (
            <>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateProduct('prev');
                }}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-[#0F172A]/80 hover:bg-[#0F172A] backdrop-blur-sm rounded-full p-1.5 sm:p-2 text-[#F1C27D] transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={16} className="sm:hidden" />
                <ChevronLeft size={20} className="hidden sm:block" />
              </motion.button>
              
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateProduct('next');
                }}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-[#0F172A]/80 hover:bg-[#0F172A] backdrop-blur-sm rounded-full p-1.5 sm:p-2 text-[#F1C27D] transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={16} className="sm:hidden" />
                <ChevronRight size={20} className="hidden sm:block" />
              </motion.button>
            </>
          )}
          
          <motion.div
            className="w-full md:w-1/2 aspect-square overflow-hidden relative bg-[#334155] cursor-pointer"
            custom={0}
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            onClick={() => setShowImageViewer(true)}
          > 
            <WatermarkedImage
              src={productImages[currentImageIndex]}
              alt={product.title || 'Product Image'}
              className="w-full h-full object-contain object-center transition-transform duration-300 hover:scale-105"
              watermarkOpacity={0.4}
              showLogo={true}
              showWhatsApp={true}
            />
            
            {/* Image Navigation Dots */}
            {productImages.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-[#F1C27D] scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Zoom Indicator */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#0F172A]/60 backdrop-blur-sm rounded-full p-1.5 sm:p-2 text-[#F1C27D]">
              <ZoomIn size={12} className="sm:hidden" />
              <ZoomIn size={16} className="hidden sm:block" />
            </div>
            
            {/* Decorative corner patterns */}
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-[#F1C27D]/60 rounded-tl-md"></div>
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-r-2 border-[#F1C27D]/60 rounded-tr-md"></div>
            <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-l-2 border-[#F1C27D]/60 rounded-bl-md"></div>
            <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-[#F1C27D]/60 rounded-br-md"></div>
          </motion.div>
          
          <div className="w-full md:w-1/2 p-3 sm:p-6 md:p-8 flex flex-col overflow-y-auto text-[#F8FAFC]">
            <motion.h2
              custom={1} variants={modalContentVariants} initial="hidden" animate="visible"
              className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent"
            >
              {product.title || "Untitled Product"}
            </motion.h2>
            
            {/* Product Counter */}
            {allProducts.length > 1 && (
              <motion.div
                custom={1.5} variants={modalContentVariants} initial="hidden" animate="visible"
                className="text-xs sm:text-sm text-[#F1C27D] mb-3 sm:mb-4"
              >
                Product {currentProductIndex + 1} of {allProducts.length}
              </motion.div>
            )}
            
            <motion.div
              custom={2} variants={modalContentVariants} initial="hidden" animate="visible"
              className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed mb-4 sm:mb-6 prose prose-sm max-w-none flex-grow"
            >
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p>Detailed description for this beautiful product will be available soon. Stay tuned!</p>
              )}
            </motion.div>
            
            {product.tags && product.tags.length > 0 && (
              <motion.div
                custom={3} variants={modalContentVariants} initial="hidden" animate="visible"
                className="mb-4 sm:mb-6"
              >
                <h4 className="text-[10px] sm:text-xs font-semibold text-[#E2E8F0] uppercase mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {product.tags.map((tag, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (0.35 + 3 * 0.1) + idx * 0.05 }}
                      className="bg-[#334155] text-[#F1C27D] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs shadow-sm"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
            
            <div className="mt-auto pt-3 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <WhatsAppButton
                phoneNumber="+92 300 5567507"
                productName={product.title}
                productId={product._id}
                className="flex-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-xs sm:text-sm flex items-center justify-center"
                custom={4}
                variants={modalContentVariants} initial="hidden" animate="visible"
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
              >
                <ShoppingBag size={14} className="mr-2 sm:hidden" />
                <ShoppingBag size={18} className="mr-2 hidden sm:block" />
                Order via WhatsApp
              </WhatsAppButton>
              
              <motion.button
                custom={5}
                variants={modalContentVariants} initial="hidden" animate="visible"
                onClick={onClose}
                className="flex-1 bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full text-xs sm:text-sm flex items-center justify-center"
                aria-label="Close"
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
              >
                <X size={14} className="mr-2 sm:hidden" />
                <X size={18} className="mr-2 hidden sm:block" />
                Close
              </motion.button>
            </div>
          </div>
          
          <motion.button
            initial={{ opacity:0, scale:0.5 }}
            animate={{ opacity:1, scale:1, transition: {delay: 0.5} }}
            onClick={onClose}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 text-[#F8FAFC] hover:text-white bg-[#0F172A]/60 hover:bg-[#0F172A]/80 rounded-full p-1.5 sm:p-2 transition-all z-20"
            aria-label="Close product details"
            whileHover={{ rotate: 90, scale: 1.1 }}
          >
            <X size={16} className="sm:hidden" />
            <X size={20} className="hidden sm:block" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {showImageViewer && (
          <ImageViewer
            images={productImages}
            currentImageIndex={currentImageIndex}
            onImageChange={setCurrentImageIndex}
            onClose={() => setShowImageViewer(false)}
            productTitle={product.title}
            allProducts={allProducts}
            currentProduct={product}
            onProductChange={onProductChange}
          />
        )}
      </AnimatePresence>
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
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Order ${productName} on WhatsApp`}
      onClick={(e) => e.stopPropagation()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.a>
  );
};

// Enhanced ProductCard Component for Mobile
const ProductCard = ({ product, index, onClick, searchTerm }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef(null);

  const getImagePath = (imageName) => {
    if (typeof imageName === 'string' && imageName.trim() !== '') {
      if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
        return imageName;
      }
      const path = imageName.startsWith('/') ? imageName.substring(1) : imageName;
      return `${API_BASE_URL}/${path}`;
    }
    return '/placeholder-image.png';
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
        <span key={index} className="bg-[#F1C27D] text-[#0F172A] px-0.5 rounded text-xs sm:text-sm">
          {part}
        </span>
      ) : part
    );
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        duration: 0.4, 
        ease: "easeOut",
        delay: index * 0.05 // Faster staggered delay for mobile
      }
    }
  };

  // Handle 3D tilt for desktop only
  const MAX_TILT = 8;
  
  const handleMouseMove = (e) => {
    // Only apply tilt on desktop
    if (!cardRef.current || !isHovered || window.innerWidth < 768) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const tiltX = (mouseY / (rect.height / 2)) * -MAX_TILT;
    const tiltY = (mouseX / (rect.width / 2)) * MAX_TILT;
    
    cardRef.current.style.setProperty('--tilt-x', `${tiltX}deg`);
    cardRef.current.style.setProperty('--tilt-y', `${tiltY}deg`);
  };
  
  const resetTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--tilt-x', '0deg');
    cardRef.current.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      className="group relative aspect-[3/4] bg-[#1E293B] rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-300 sm:duration-500"
      onClick={() => onClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        resetTilt();
      }}
      onMouseMove={handleMouseMove}
      whileHover={{ 
        y: window.innerWidth >= 768 ? -8 : -4, 
        transition: { type: "spring", stiffness: 300, damping: 15 } 
      }}
      whileTap={{ scale: 0.98 }}
      style={{ 
        transformStyle: "preserve-3d",
        transform: "perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
      }}
    >
      {/* Shine effect - reduced for mobile */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 sm:group-hover:opacity-30 bg-gradient-to-tr from-transparent via-white to-transparent z-10 transition-opacity duration-500 sm:duration-700 ease-out"
        style={{
          backgroundSize: "200% 200%",
          backgroundPosition: isHovered ? "100% 100%" : "0% 0%",
          transition: "background-position 0.5s ease-out, opacity 0.3s ease-out"
        }}
      />
      
      <div className="absolute inset-0 overflow-hidden rounded-lg sm:rounded-xl">
        <motion.div
          key={currentImageSrc}
          initial={{ scale: 1.02, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ 
            scale: window.innerWidth >= 768 ? 1.08 : 1.05, 
            transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } 
          }}
          transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
          style={{ transformOrigin: "center center" }}
          className="w-full h-full"
        >
          {!imageLoaded && (
            <div className="w-full h-full bg-[#334155] animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-[#F1C27D] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <WatermarkedImage
            src={currentImageSrc}
            alt={product.title || 'Product Image'}
            className={`w-full h-full object-cover object-center transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            watermarkOpacity={0.4}
            showLogo={true}
            showWhatsApp={true}
          />
        </motion.div>
      </div>

      {/* Decorative corner elements - smaller for mobile */}
      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 w-3 h-3 sm:w-4 sm:h-4 border-t border-l border-[#F1C27D]/50 rounded-tl transition-all duration-300 group-hover:w-4 group-hover:h-4 sm:group-hover:w-6 sm:group-hover:h-6 group-hover:border-[#F1C27D]"></div>
      <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 border-t border-r border-[#F1C27D]/50 rounded-tr transition-all duration-300 group-hover:w-4 group-hover:h-4 sm:group-hover:w-6 sm:group-hover:h-6 group-hover:border-[#F1C27D]"></div>
      <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 w-3 h-3 sm:w-4 sm:h-4 border-b border-l border-[#F1C27D]/50 rounded-bl transition-all duration-300 group-hover:w-4 group-hover:h-4 sm:group-hover:w-6 sm:group-hover:h-6 group-hover:border-[#F1C27D]"></div>
      <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 border-b border-r border-[#F1C27D]/50 rounded-br transition-all duration-300 group-hover:w-4 group-hover:h-4 sm:group-hover:w-6 sm:group-hover:h-6 group-hover:border-[#F1C27D]"></div>

      {/* Enhanced product info overlay for mobile */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/85 to-transparent text-white">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-1 text-[#F8FAFC] group-hover:text-[#F1C27D] transition-colors duration-300">
          {highlightSearchTerm(product.title || "Untitled Product", searchTerm)}
        </h2>

        {/* Mobile-first hover content */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={isHovered ? { 
            opacity: 1, 
            height: "auto",
            transition: { duration: 0.3, ease: "easeOut" }
          } : { 
            opacity: 0, 
            height: 0,
            transition: { duration: 0.2, ease: "easeIn" }
          }}
          className="overflow-hidden"
        >
          <div className="space-y-1.5 sm:space-y-2">
            <motion.div 
              className="flex items-center text-xs sm:text-sm text-[#E2E8F0] group-hover:text-white"
              initial={{ x: -4, opacity: 0 }}
              animate={isHovered ? { x: 0, opacity: 1, transition: { delay: 0.1 } } : { x: -4, opacity: 0 }}
            >
              View Details
              <ArrowRight size={12} className="ml-1 sm:hidden" />
              <ArrowRight size={14} className="ml-1 hidden sm:block transform group-hover:translate-x-0.5 transition-transform duration-200" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={isHovered ? { opacity: 1, y: 0, transition: { delay: 0.1 } } : { opacity: 0, y: 4 }}
              className="z-40"
            >
              <WhatsAppButton
                phoneNumber="923269475516"
                productName={product.title}
                productId={product._id}
                className="w-full bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] text-[10px] sm:text-xs font-semibold py-1 sm:py-1.5 md:py-2 px-2 rounded shadow hover:shadow-md transition-all duration-200 flex items-center justify-center z-40"
              >
                <ShoppingBag size={10} className="mr-1 sm:hidden" />
                <ShoppingBag size={12} className="mr-1.5 hidden sm:block" />
                Order Now
              </WhatsAppButton>
            </motion.div>
          </div>
        </motion.div>

        {/* Always visible quick action for mobile */}
        <div className="sm:hidden mt-1">
          <div className="flex items-center justify-between text-xs text-[#E2E8F0]">
            <span>Tap to view</span>
            <Eye size={12} className="opacity-60" />
          </div>
        </div>
      </div>
      
      {/* Hover eye icon for desktop */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.05 } }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 sm:p-3 bg-[#F1C27D]/20 backdrop-blur-sm rounded-full pointer-events-none z-20 hidden sm:block"
          >
            <Eye size={20} className="sm:hidden" />
            <Eye size={26} className="hidden sm:block text-[#F8FAFC]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main Component with Enhanced Mobile Support
const ProductPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formattedTitle = formatCategoryName(categoryName);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/products/category/${categoryName}`
        );
        const sortedProducts = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setProducts(sortedProducts);
      } catch (err) {
        console.error(`Error fetching products for category ${categoryName}:`, err);
        if (err.response?.status === 404) {
          setError(`No products found for the category "${formattedTitle}".`);
        } else {
          setError("Failed to load products. Please check the category or try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchProducts();
    } else {
      setError("Category not specified.");
      setLoading(false);
    }
  }, [categoryName, formattedTitle]);

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
        staggerChildren: 0.05, // Faster for mobile
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="bg-[#0F172A] min-h-screen font-sans selection:bg-[#F1C27D] selection:text-[#0F172A] relative">
      {/* Decorative patterns - hidden on mobile for performance */}
      <DecorativePattern className="top-10 left-10 opacity-20 rotate-12 hidden sm:block" />
      <DecorativePattern className="bottom-20 right-10 opacity-10 -rotate-12 hidden sm:block" />
      <DecorativePattern className="top-1/3 right-1/4 opacity-5 rotate-45 hidden lg:block" />
      
      <div className="container mx-auto max-w-screen-xl px-3 sm:px-4 lg:px-8 py-6 sm:py-10 relative z-10">
        {/* Enhanced page heading for mobile */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-3 sm:mb-4"
          >
            <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] rounded-full mx-auto"></div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent px-2"
          >
            {loading ? 'Loading Category...' : formattedTitle || 'Products'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-sm sm:text-lg text-[#E2E8F0] max-w-3xl mx-auto px-4"
          >
            Explore our exquisite collection of handcrafted {formattedTitle} pieces from Gandhara
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-4 sm:mt-6"
          >
            <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-[#F1C27D] to-[#E6A44E] rounded-full mx-auto"></div>
          </motion.div>
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

        {/* Loading State - Mobile optimized grid */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {[...Array(skeletonCount)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-8 sm:py-12 px-4"
          >
            <p className="text-[#F1C27D] bg-[#1E293B] p-4 sm:p-6 rounded-xl shadow-lg inline-block mb-4 sm:mb-6 text-sm sm:text-base">
              {error}
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              View All Products
              <ArrowRight size={14} className="ml-2 sm:hidden" />
              <ArrowRight size={16} className="ml-2 hidden sm:block" />
            </Link>
          </motion.div>
        )}

        {/* Empty State - No Products */}
        {!loading && !error && products.length === 0 && (    
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-8 sm:py-12 px-4"
          >
            <p className="text-[#E2E8F0] text-base sm:text-lg mb-4 sm:mb-6">
              No products found in the "{formattedTitle}" category.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              View All Products
              <ArrowRight size={14} className="ml-2 sm:hidden" />
              <ArrowRight size={16} className="ml-2 hidden sm:block" />
            </Link>
          </motion.div>
        )}

        {/* Empty Search Results */}
        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && searchTerm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-8 sm:py-12 px-4"
          >
            <p className="text-[#E2E8F0] text-base sm:text-lg mb-4 sm:mb-6">
              No products found matching "{searchTerm}" in {formattedTitle}.
            </p>
            <motion.button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Search
              <X size={14} className="ml-2 sm:hidden" />
              <X size={16} className="ml-2 hidden sm:block" />
            </motion.button>
          </motion.div>
        )}

        {/* Enhanced Products Grid - Mobile First */}
        {!loading && !error && filteredProducts.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
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
          </motion.div>
        )}

        {/* Product count indicator for mobile */}
        {!loading && !error && filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-[#94A3B8]"
          >
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {searchTerm && ` matching "${searchTerm}"`}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct} 
            onClose={closeModal}
            allProducts={filteredProducts}
            onProductChange={handleProductChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;