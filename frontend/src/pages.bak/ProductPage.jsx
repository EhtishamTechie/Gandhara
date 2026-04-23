import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Eye, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Search, Star, Heart, Share2, Filter, Grid, List } from "lucide-react";
import WatermarkedImage from '../components/WatermarkedImage';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Decorative SVG Pattern Component ---
const DecorativePattern = ({ className }) => (
  <div className={`absolute pointer-events-none ${className}`}>
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.08">
      <path d="M60 0L74.2857 45.7143L120 60L74.2857 74.2857L60 120L45.7143 74.2857L0 60L45.7143 45.7143L60 0Z" fill="url(#paint0_linear)" />
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// --- Enhanced Loading Component ---
const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
    <div className="aspect-square bg-slate-200"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
      <div className="flex space-x-2">
        <div className="h-8 bg-slate-200 rounded-full w-16"></div>
        <div className="h-8 bg-slate-200 rounded-full w-16"></div>
      </div>
    </div>
  </div>
);

// Function to format category name
const formatCategoryName = (name) => {
  if (!name) return "";
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getCategoryMapping = (urlName) => {
  return urlName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// --- Enhanced Search Component ---
const SearchBar = ({ searchTerm, onSearchChange, totalProducts, filteredCount }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="max-w-2xl mx-auto mb-8"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search products in this collection..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl"
        />
        {searchTerm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors duration-200"
          >
            <X size={20} />
          </motion.button>
        )}
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-center text-sm text-slate-600"
        >
          {filteredCount === 0 ? (
            <span className="text-red-500 bg-red-50 px-4 py-2 rounded-lg">
              No products found matching "{searchTerm}"
            </span>
          ) : (
            <span className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg">
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
        {/* Product Navigation - Show when there are multiple products */}
        {allProducts && allProducts.length > 1 && (
          <>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                navigateProduct('prev');
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-4 text-white transition-all duration-200 shadow-2xl"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={28} />
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                navigateProduct('next');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-4 text-white transition-all duration-200 shadow-2xl"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={28} />
            </motion.button>
          </>
        )}

        {/* Main Image */}
        <div className="relative max-w-[90vw] max-h-[90vh] overflow-hidden rounded-2xl">
          <motion.div
            key={`${currentProduct._id}-${currentImageIndex}`}
            ref={imageRef}
            className={`max-w-full max-h-full cursor-${isZoomed ? 'zoom-out' : 'zoom-in'} transition-transform duration-500 ease-out`}
            style={{
              transform: isZoomed ? `scale(2.5)` : 'scale(1)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
            }}
            onClick={handleImageClick}
            onMouseMove={handleMouseMove}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <WatermarkedImage
              src={currentImage}
              alt={`${productTitle} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain shadow-2xl"
              watermarkOpacity={0.3}
              showLogo={true}
              showWhatsApp={true}
            />
          </motion.div>
        </div>

        {/* Enhanced UI Elements */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4">
          {/* Product Counter */}
          {allProducts && allProducts.length > 1 && (
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
              Product {currentProductIndex + 1} of {allProducts.length}
            </div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
              Image {currentImageIndex + 1} of {images.length}
            </div>
          )}
        </div>

        {/* Zoom Indicator */}
        <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm rounded-full p-3 text-white">
          {isZoomed ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
        </div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-200 shadow-2xl"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={24} />
        </motion.button>

        {/* Instructions */}
        <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-3 text-white text-sm max-w-xs">
          <div className="space-y-1">
            {allProducts && allProducts.length > 1 && <div>← → Navigate products</div>}
            <div>Click to {isZoomed ? 'zoom out' : 'zoom in'}</div>
            <div>ESC to close</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Enhanced Product Detail Modal ---
const ProductDetailModal = ({ product, onClose, allProducts, onProductChange }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const getModalImagePath = (imageName) => {
    if (typeof imageName === 'string' && imageName.trim() !== '') {
      if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
        return imageName;
      }
      const path = imageName.startsWith('/') ? imageName.substring(1) : imageName;
      return `${API_BASE_URL}/${path}`;
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
    setCurrentImageIndex(0);
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this beautiful ${product.title} from Gandhara Arts`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.4
          }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col lg:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Product Navigation Arrows */}
          {allProducts.length > 1 && (
            <>
              <motion.button
                onClick={() => navigateProduct('prev')}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 text-slate-700 shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.1, x: -3 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={20} />
              </motion.button>

              <motion.button
                onClick={() => navigateProduct('next')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 text-slate-700 shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.1, x: 3 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={20} />
              </motion.button>
            </>
          )}

          {/* Image Section */}
          <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-slate-50 to-slate-100">
            <div 
              className="aspect-square lg:h-full lg:aspect-auto cursor-pointer relative overflow-hidden group"
              onClick={() => setShowImageViewer(true)}
            >
              <WatermarkedImage
                src={productImages[currentImageIndex]}
                alt={product.title || 'Product Image'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                watermarkOpacity={0.4}
                showLogo={true}
                showWhatsApp={true}
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-4">
                  <ZoomIn size={24} className="text-slate-700" />
                </div>
              </div>
            </div>

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
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      index === currentImageIndex
                        ? 'bg-indigo-600 scale-125'
                        : 'bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex-shrink-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight">
                    {product.title || "Untitled Product"}
                  </h2>
                  
                  {/* Product Counter */}
                  {allProducts.length > 1 && (
                    <div className="text-sm text-slate-500 mb-4">
                      Product {currentProductIndex + 1} of {allProducts.length}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isFavorite 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-slate-100 text-slate-400 hover:text-red-500'
                    }`}
                  >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  
                  <button
                    onClick={shareProduct}
                    className="p-2 rounded-full bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors duration-200"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Rating (placeholder) */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm text-slate-600">(4.8) • 127 reviews</span>
              </div>
            </div>

            {/* Description */}
            <div className="flex-1 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
              <p className="text-slate-600 leading-relaxed">
                {product.description || "This exquisite handcrafted piece represents the finest tradition of Gandhara artistry. Each item is carefully created by skilled artisans using time-honored techniques passed down through generations. The attention to detail and quality of craftsmanship makes this a truly unique addition to any collection."}
              </p>
            </div>

            {/* Tags/Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex-shrink-0 space-y-3">
              <WhatsAppButton
                phoneNumber="+92 300 5567507"
                productName={product.title}
                productId={product._id}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-[1.02]"
              >
                <ShoppingBag size={20} />
                <span>Order via WhatsApp</span>
              </WhatsAppButton>

              <button
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors duration-300"
              >
                Continue Browsing
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white/80 hover:bg-white rounded-full p-2 transition-all z-30 shadow-lg"
          >
            <X size={20} />
          </button>
        </motion.div>
      </motion.div>

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
  const message = `Hello! I'm interested in your product: ${productName} (ID: ${productId}). Could you please provide more details?`;
  const encodedMessage = encodeURIComponent(message);
  const cleanPhoneNumber = phoneNumber.replace(/\s+/g, "").replace("+", "");
  const whatsappLink = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;

  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => e.stopPropagation()}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.a>
  );
};

// Enhanced ProductCard Component
const ProductCard = ({ product, index, onClick, searchTerm }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const getImagePath = (imageName) => {
    if (typeof imageName === 'string' && imageName.trim() !== '') {
      if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
        return imageName;
      }
      const path = imageName.startsWith('/') ? imageName.substring(1) : imageName;
      return `${API_BASE_URL}/${path}`;
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
        <span key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: "easeOut"
      }}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          className="relative w-full h-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <WatermarkedImage
            src={currentImageSrc}
            alt={product.title || 'Product Image'}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            watermarkOpacity={0.4}
            showLogo={true}
            showWhatsApp={true}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          )}
        </motion.div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="flex space-x-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 text-slate-700 hover:bg-white'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
            
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 flex items-center space-x-1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Eye size={14} className="text-slate-600" />
              <span className="text-xs text-slate-600 font-medium">View</span>
            </motion.div>
          </div>
        </div>

        {/* Image Count Badge */}
        {product.images && product.images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            +{product.images.length - 1}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-slate-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
            {highlightSearchTerm(product.title || "Untitled Product", searchTerm)}
          </h3>
        </div>

        {/* Category Tags */}
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.categories.slice(0, 2).map((category, idx) => (
              <span
                key={idx}
                className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full font-medium"
              >
                {category}
              </span>
            ))}
            {product.categories.length > 2 && (
              <span className="text-xs text-slate-500 px-1">
                +{product.categories.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <WhatsAppButton
            phoneNumber="+92 300 5567507"
            productName={product.title}
            productId={product._id}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
          >
            <ShoppingBag size={14} />
            <span>Order</span>
          </WhatsAppButton>
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onClick(product);
            }}
            className="bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 p-2.5 rounded-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main ProductPage Component ---
const ProductPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Format the category name for display
  const formattedCategoryName = formatCategoryName(categoryName);
  const categoryMapping = getCategoryMapping(categoryName);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/products/category/${encodeURIComponent(categoryName)}`);
        
        if (response.data && response.data.success && response.data.products) {
          const allProducts = response.data.products;
          
          // Filter products by category
          const categoryProducts = allProducts.filter(product => {
            if (!product.categories || !Array.isArray(product.categories)) {
              return false;
            }
            
            return product.categories.some(cat => {
              const normalizedCat = cat.toLowerCase().replace(/\s+/g, '-');
              const normalizedCategoryName = categoryName.toLowerCase();
              return normalizedCat === normalizedCategoryName || 
                     cat.toLowerCase() === categoryMapping.toLowerCase();
            });
          });

          setProducts(categoryProducts);
          setFilteredProducts(categoryProducts);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching category products:', error);
        setError(error.response?.data?.message || 'Failed to load products');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchCategoryProducts();
    }
  }, [categoryName, categoryMapping]);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleProductChange = (newProduct) => {
    setSelectedProduct(newProduct);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Background Pattern */}
        <DecorativePattern className="top-10 right-10" />
        <DecorativePattern className="bottom-20 left-20" />
        
        <div className="container mx-auto px-4 py-12">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <div className="h-12 bg-slate-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-96 mx-auto animate-pulse"></div>
          </div>

          {/* Search Skeleton */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-red-50 rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300"
            >
              <span>Back to Home</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Background Patterns */}
      <DecorativePattern className="top-10 right-10" />
      <DecorativePattern className="bottom-20 left-20 rotate-180" />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              {formattedCategoryName}
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            Discover our exquisite collection of {formattedCategoryName.toLowerCase()}, 
            crafted with traditional techniques and modern artistry.
          </motion.p>

          {/* Product Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6"
          >
            <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Available
            </span>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalProducts={products.length}
          filteredCount={filteredProducts.length}
        />

        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}
            layout
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
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={48} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Products Found</h3>
              <p className="text-slate-600 mb-8">
                {searchTerm
                  ? `No products match your search "${searchTerm}"`
                  : `No products available in ${formattedCategoryName} category`}
              </p>
              
              {searchTerm && (
                <motion.button
                  onClick={() => setSearchTerm('')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Search
                </motion.button>
              )}
              
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  <span>Browse All Categories</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back to Categories Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-semibold text-lg group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to All Categories</span>
          </Link>
        </motion.div>
      </div>

      {/* Product Detail Modal */}
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
