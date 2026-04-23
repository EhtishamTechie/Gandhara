// src/pages/AllProductsPage.jsx
'use client';

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../utils/imageHelper.js";
import { X, ZoomIn, ZoomOut, ShoppingBag, Wind, Feather, ArrowRight, Eye, Star, ChevronLeft, ChevronRight, Search } from "lucide-react";
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

// --- Search Component ---
const SearchBar = ({ searchTerm, onSearchChange, totalProducts, filteredCount }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="max-w-md mx-auto mb-8"
    >
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
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 md:text-[#94A3B8] hover:text-[#F1C27D] transition-colors duration-200"
          >
            <X size={18} />
          </motion.button>
        )}
      </div>
      
      {/* Search Results Info */}
      {searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-center text-sm text-gray-600 md:text-[#E2E8F0]"
        >
          {filteredCount === 0 ? (
            <span className="text-[#E6A44E] md:text-[#F1C27D]">No products found matching "{searchTerm}"</span>
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

// --- WhatsApp Button Component ---
const WhatsAppButton = ({ phoneNumber, productName, className, children, ...props }) => {
  const cleanPhoneNumber = phoneNumber.replace(/\s+/g, "").replace("+", "");
  const message = productName
    ? `Hello! I'm interested in your product: ${productName}. Could you please provide more details?`
    : "Hello! I'm interested in your products. Could you please provide more details?";
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;

  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Order ${productName || 'product'} on WhatsApp`}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </motion.a>
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
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
        <motion.div
          key={currentProduct._id}
          ref={imgRef}
          className={`max-w-full max-h-full ${
            zoomLevel > 1 ? 'cursor-move' : 'cursor-zoom-in'
          }`}
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
          onClick={handleImageClick}
          onMouseDown={handleMouseDown}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <WatermarkedImage
            src={currentImage}
            alt={currentProduct.title}
            className="max-w-full max-h-full object-contain select-none"
            watermarkOpacity={0.3}
            showLogo={true}
            showWhatsApp={true}
          />
        </motion.div>

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
      </motion.div>
    </AnimatePresence>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center p-4 z-50"
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
          className="relative bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row transform-gpu"
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
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#0F172A]/80 hover:bg-[#0F172A] backdrop-blur-sm rounded-full p-2 text-[#F1C27D] transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={20} />
              </motion.button>
              
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateProduct('next');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#0F172A]/80 hover:bg-[#0F172A] backdrop-blur-sm rounded-full p-2 text-[#F1C27D] transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={20} />
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
          </motion.div>
          
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto text-[#F8FAFC]">
            <motion.h2
              custom={1} variants={modalContentVariants} initial="hidden" animate="visible"
              className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent"
            >
              {product.title || "Untitled Product"}
            </motion.h2>
            
            {/* Product Counter */}
            {allProducts.length > 1 && (
              <motion.div
                custom={1.5} variants={modalContentVariants} initial="hidden" animate="visible"
                className="text-sm text-[#F1C27D] mb-4"
              >
                Product {currentProductIndex + 1} of {allProducts.length}
              </motion.div>
            )}
            
            <motion.div
              custom={2} variants={modalContentVariants} initial="hidden" animate="visible"
              className="text-sm text-[#E2E8F0] leading-relaxed mb-6 prose prose-sm max-w-none flex-grow"
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
                className="mb-6"
              >
                <h4 className="text-xs font-semibold text-[#E2E8F0] uppercase mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (0.35 + 3 * 0.1) + idx * 0.05 }}
                      className="bg-[#334155] text-[#F1C27D] px-2.5 py-1 rounded-full text-xs shadow-sm"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
            
            <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-3">
              <WhatsAppButton
                phoneNumber="+923005567507"
                productName={product.title}
                className="flex-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm flex items-center justify-center"
                custom={4}
                variants={modalContentVariants} initial="hidden" animate="visible"
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
              >
                <ShoppingBag size={18} className="mr-2" /> Order via WhatsApp
              </WhatsAppButton>
              
              <motion.button
                custom={5}
                variants={modalContentVariants} initial="hidden" animate="visible"
                onClick={onClose}
                className="flex-1 bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full text-sm flex items-center justify-center"
                aria-label="Close"
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
              >
                <X size={18} className="mr-2" /> Close
              </motion.button>
            </div>
          </div>
          
          <motion.button
            initial={{ opacity:0, scale:0.5 }}
            animate={{ opacity:1, scale:1, transition: {delay: 0.5} }}
            onClick={onClose}
            className="absolute top-3 right-3 text-[#F8FAFC] hover:text-white bg-[#0F172A]/60 hover:bg-[#0F172A]/80 rounded-full p-2 transition-all z-20"
            aria-label="Close product details"
            whileHover={{ rotate: 90, scale: 1.1 }}
          >
            <X size={20} />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Image Viewer Modal with Product Navigation */}
      <AnimatePresence>
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
      </AnimatePresence>
    </>
  );
};

// --- Enhanced Product Card Component ---
const ProductCard = ({ product, onClick, searchTerm }) => {
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
  
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" }}
  };

  const imageHoverAnimation = {
    scale: 1.1,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
  };
  
  const titleVariants = {
    initial: { y: 0 },
    hover: { y: -3, transition: { duration: 0.2 } }
  };

  // 3D tilt effect parameters
  const MAX_TILT = 10; // Maximum tilt in degrees
  
  // Handle mouse movement for 3D effect
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

  // Mobile-optimized card layout
  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      className="group relative bg-white md:bg-[#1E293B] rounded-2xl md:rounded-xl shadow-sm md:shadow-xl hover:shadow-lg md:hover:shadow-2xl overflow-hidden transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        resetTilt();
      }}
      onMouseMove={handleMouseMove}
      whileHover={{ y: [-2, -8], transition: { type: "spring", stiffness: 300, damping: 15 } }}
      style={{ 
        transformStyle: "preserve-3d",
        transform: "perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
      }}
    >
      {/* Mobile Layout - Card Style */}
      <div className="md:hidden flex">
        {/* Image Section */}
        <div 
          className="w-1/3 min-h-[120px] bg-gray-100 cursor-pointer"
          onClick={() => onClick(product)}
        > 
          <WatermarkedImage
            src={primaryImageSrc}
            alt={product.title || 'Product Image'}
            className="w-full h-full object-cover"
            watermarkOpacity={0.4}
            showLogo={true}
            showWhatsApp={true}
          />
         
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-4">
          <h3 
            className="text-gray-800 font-semibold text-base mb-2 line-clamp-2 cursor-pointer"
            onClick={() => onClick(product)}
          >
            {highlightSearchTerm(product.title || "Untitled Product", searchTerm)}
          </h3>
          
          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onClick(product)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Eye size={14} className="mr-1" />
              View Details
            </button>
            
            <WhatsAppButton
              phoneNumber="+923005567507"
              productName={product.title}
              className="flex-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-white text-sm font-semibold py-2 px-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
            >
              <ShoppingBag size={14} className="mr-1" />
              Order Now
            </WhatsAppButton>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Original Grid Style */}
      <div className="hidden md:block aspect-[3/4] cursor-pointer" onClick={() => onClick(product)}>
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
          <motion.div
            key={currentImageSrc}
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            whileHover={imageHoverAnimation}
            transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={{ transformOrigin: "center center" }}
            className="w-full h-full"
          >
            <WatermarkedImage
              src={currentImageSrc}
              alt={product.title || 'Product Image'}
              className="w-full h-full object-cover object-center"
              watermarkOpacity={0.4}
              showLogo={true}
              showWhatsApp={true}
            />
          </motion.div>
        
        </div>

        {/* Small decorative corner elements */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#F1C27D]/50 rounded-tl transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-[#F1C27D]"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#F1C27D]/50 rounded-tr transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-[#F1C27D]"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#F1C27D]/50 rounded-bl transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-[#F1C27D]"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#F1C27D]/50 rounded-br transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-[#F1C27D]"></div>

        {/* Always visible product info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/80 to-transparent text-white">
          <motion.h2
            variants={titleVariants}
            initial="initial"
            whileHover="hover" 
            className="text-base sm:text-lg font-semibold mb-2 truncate text-[#F8FAFC] group-hover:text-[#F1C27D] transition-colors duration-300"
          >
            {highlightSearchTerm(product.title || "Untitled Product", searchTerm)}
          </motion.h2>

          {/* Always visible content - no hover required */}
          <div className="space-y-2">
            <div className="flex items-center text-xs sm:text-sm text-[#E2E8F0]">
              View Details
              <ArrowRight size={14} className="ml-1" />
            </div>
            
            <div>
              <WhatsAppButton
                phoneNumber="+923005567507"
                productName={product.title}
                className="w-full bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] text-[11px] sm:text-xs font-semibold py-1.5 sm:py-2 px-2 rounded-md shadow hover:shadow-md transition-all duration-200 flex items-center justify-center"
              >
                <ShoppingBag size={12} className="mr-1.5" /> Order Now
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main AllProductsPage Component ---
const AllProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/products/all`);
        const productData = Array.isArray(response.data) ? response.data : [];
        if (productData.length === 0 && response.data && !Array.isArray(response.data)) {
            // console.warn("API did not return an array. Data received:", response.data); 
        }
        const sortedProducts = productData.sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setProducts(sortedProducts);
      } catch (err) {
        console.error("Error fetching all products:", err);
        setError("Oops! We couldn't fetch the treasures. Please try again soon.");
        if (err.response) {
          // console.error("Error response data:", err.response.data); 
          // console.error("Error response status:", err.response.status); 
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []); 

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
              <motion.span
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.1, ease: "circOut" }}
                className="inline-block mr-2 sm:mr-3"
              >
                {word}
              </motion.span>
            ))}
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-[#E2E8F0] text-lg max-w-2xl mx-auto text-center mb-12"
          >
            Explore our timeless artifacts and exquisite craftsmanship from Gandhara art tradition
          </motion.p>
          
          {/* Decorative bar after heading */}
          <div className="w-24 h-1 bg-gradient-to-r from-[#F1C27D] to-[#E6A44E] rounded-full mx-auto mb-10"></div>
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

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[...Array(skeletonCount)].map((_, index) => (
               <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && error && (
           <div className="text-center py-12 px-4">
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="inline-block">
                <Wind size={48} className="text-[#E6A44E] md:text-[#F1C27D] mb-4 mx-auto" />
                <p className="text-[#E6A44E] md:text-[#F1C27D] bg-white md:bg-[#1E293B] p-4 rounded-lg shadow-md">{error}</p>
              </motion.div>
           </div>
        )}

        {!loading && !error && products.length === 0 && (
           <div className="text-center py-20 px-4">
             <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}>
                <Feather size={60} className="text-[#E6A44E] md:text-[#F1C27D] mb-6 mx-auto" />
                <p className="text-gray-700 md:text-[#E2E8F0] text-xl mb-5">
                    Our gallery is currently awaiting new masterpieces.
                </p>
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => window.location.href='/'} 
                    className="mt-4 inline-block bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                    Return Home
                </motion.button>
             </motion.div>
           </div>
        )}

        {/* Empty Search Results */}
        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && searchTerm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12 px-4"
          >
            <p className="text-gray-700 md:text-[#E2E8F0] text-lg mb-6">
              No products found matching "{searchTerm}".
            </p>
            <motion.button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Search
              <X size={16} className="ml-2" />
            </motion.button>
          </motion.div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.07, delayChildren: 0.3 }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {filteredProducts.map((product) => (
              product && product._id ? ( 
                <ProductCard
                  key={product._id}
                  product={product}
                  onClick={handleProductClick}
                  searchTerm={searchTerm}
                />
              ) : (
                null 
              )
            ))}
          </motion.div>
        )}
      </div>

      {/* Desktop Background decorative gradient at bottom */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0F172A] to-transparent pointer-events-none"></div>
      
      {/* Floating scroll indicator - Desktop only */}
      <motion.div
        className="hidden md:flex fixed bottom-8 right-1/2 transform translate-x-1/2 bg-[#1E293B] rounded-full p-3 shadow-lg z-10 cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0 
        }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F1C27D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </motion.div>

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

export default AllProductsPage;
