'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Eye, ArrowRight, ArrowLeft, Star, Sparkles, Zap } from 'lucide-react';
import axios from 'axios';

const FeaturedProductsShowcase = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);

  // WhatsApp number - updated to your number
  const whatsappNumber = "923005567507";
  
  // Create WhatsApp message with product information
  const createWhatsAppLink = (product) => {
    const message = `Hello! I'm interested in ordering: ${product.title}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  // Get image path function
  const getImagePath = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
   return `${import.meta.env.VITE_API_URL}/${imagePath}`;
  };

  // Fetch products that are marked as featuredProducts by admin
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/category/featuredProducts`);
        
        // Sort by creation date (newest first)
        const sortedProducts = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setFeaturedProducts(sortedProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Enhanced auto-play functionality with smooth transitions
  useEffect(() => {
    if (!autoPlay || featuredProducts.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
        setIsTransitioning(false);
      }, 300);
    }, 6000); // Keep the 6 second timing

    return () => clearInterval(interval);
  }, [autoPlay, featuredProducts.length]);

  // Premium navigation functions with smooth transitions
  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  if (loading) {
    return (
      <section className="relative min-h-screen bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gray-50/30" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full"
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="ml-4 text-black text-xl font-semibold"
          >
            Loading Featured Products...
          </motion.p>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <section className="relative min-h-screen bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gray-50/30" />
        <div className="relative z-10 flex items-center justify-center min-h-screen text-center">
          <div className="bg-gray-100 border-2 border-gray-200 rounded-3xl p-12">
            <Sparkles className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-black mb-2">No Featured Products Yet</h2>
            <p className="text-gray-600">Add products with "featuredProducts" category in the admin panel.</p>
          </div>
        </div>
      </section>
    );
  }

  const currentProduct = featuredProducts[currentIndex];

  // Enhanced single product showcase
  if (featuredProducts.length === 1) {
    return (
      <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 overflow-hidden">
        {/* Artistic Background Elements */}
        <div className="absolute inset-0">
          {/* Golden Rays */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`ray-${i}`}
              className="absolute w-1 bg-gradient-to-t from-transparent via-yellow-600/30 to-transparent"
              style={{
                height: '120vh',
                left: `${20 + i * 10}%`,
                top: '-10vh',
                transformOrigin: 'bottom center',
              }}
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ 
                rotate: [0, 5, -5, 0],
                opacity: [0, 0.5, 0.3, 0.6, 0.2]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Floating Particles */}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-3 h-3 bg-yellow-600/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -40, 20, 0],
                scale: [1, 1.5, 0.8, 1],
                opacity: [0.3, 0.8, 0.4, 0.3],
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Main Showcase */}
        <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex items-center">
          <div className="w-full">
            {/* Majestic Header */}
            <motion.div
              initial={{ opacity: 0, y: -80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-center mb-20"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                  scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                }}
                className="inline-block mb-8"
              >
                <div className="relative">
                  <Sparkles className="w-20 h-20 text-yellow-600" />
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 w-20 h-20 bg-yellow-600/30 rounded-full blur-xl"
                  />
                </div>
              </motion.div>
              
              <motion.h1 
                className="text-6xl md:text-8xl font-bold mb-6"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2.5, delay: 0.5 }}
              >
                <motion.span 
                  className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-700 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  MASTERPIECE
                </motion.span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 1 }}
                className="text-2xl text-gray-700 max-w-3xl mx-auto font-light"
              >
                Experience the pinnacle of artisan craftsmanship
              </motion.p>
            </motion.div>

            {/* Product Showcase */}
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
              {/* Product Image - Left Side */}
              <motion.div
                initial={{ opacity: 0, x: -100, rotateY: 45 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 2.5, delay: 1.5 }}
                className="relative"
              >
                {/* Ornate Frame */}
                <motion.div
                  animate={{ 
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ 
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative p-8 bg-gradient-to-br from-yellow-100 via-white to-yellow-50 rounded-[3rem] shadow-2xl border-4 border-yellow-600/30"
                >
                  <div className="relative overflow-hidden rounded-[2rem]">
                    <motion.img
                      src={getImagePath(currentProduct.image)}
                      alt={currentProduct.title}
                      className="w-full h-[600px] object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                      animate={{ 
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Magical Overlay */}
                    <motion.div
                      animate={{ 
                        background: [
                          "linear-gradient(45deg, transparent 0%, rgba(255,215,0,0.1) 50%, transparent 100%)",
                          "linear-gradient(135deg, transparent 0%, rgba(255,215,0,0.2) 50%, transparent 100%)",
                          "linear-gradient(225deg, transparent 0%, rgba(255,215,0,0.1) 50%, transparent 100%)",
                          "linear-gradient(315deg, transparent 0%, rgba(255,215,0,0.2) 50%, transparent 100%)"
                        ]
                      }}
                      transition={{ duration: 8, repeat: Infinity }}
                      className="absolute inset-0"
                    />
                  </div>
                  
                  {/* Decorative Corner Elements */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={`corner-${i}`}
                      className={`absolute w-6 h-6 border-4 border-yellow-600 ${
                        i === 0 ? 'top-2 left-2 border-r-0 border-b-0' :
                        i === 1 ? 'top-2 right-2 border-l-0 border-b-0' :
                        i === 2 ? 'bottom-2 left-2 border-r-0 border-t-0' :
                        'bottom-2 right-2 border-l-0 border-t-0'
                      }`}
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>

                {/* Floating Badge */}
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-6 py-3 rounded-full shadow-2xl border-4 border-white"
                >
                  <span className="font-bold text-lg">EXCLUSIVE</span>
                </motion.div>
              </motion.div>

              {/* Product Details - Right Side */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 2.5, delay: 2 }}
                className="space-y-8"
              >
                <motion.h2
                  className="text-5xl md:text-6xl font-bold text-black leading-tight"
                  animate={{ 
                    textShadow: [
                      "0 0 0px rgba(0,0,0,0)",
                      "0 0 20px rgba(255,215,0,0.3)",
                      "0 0 0px rgba(0,0,0,0)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {currentProduct.title}
                </motion.h2>
                
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, delay: 2.5 }}
                  className="h-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full"
                />
                
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 2, delay: 3 }}
                  className="text-xl text-gray-700 leading-relaxed max-w-2xl"
                >
                  {currentProduct.description || "A testament to timeless artistry and unparalleled craftsmanship. This exceptional piece represents the perfect fusion of traditional techniques and contemporary elegance, destined to become a cherished heirloom for generations to come."}
                </motion.p>

                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 2, delay: 3.5 }}
                  className="pt-8"
                >
                  <motion.a
                    href={createWhatsAppLink(currentProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group inline-flex items-center space-x-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-6 rounded-2xl text-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <ShoppingCart className="w-8 h-8" />
                    </motion.div>
                    <span>Acquire This Masterpiece</span>
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-8 h-8" />
                    </motion.div>
                  </motion.a>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 4 }}
                    className="text-gray-600 text-lg mt-6 font-medium"
                  >
                    📞 Connect instantly: +92 300 556 7507
                  </motion.p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-600/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12" ref={containerRef}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-12 h-12 text-yellow-600" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-4">
            <span className="bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
              Featured
            </span>
            <br />
            <span className="text-black">Collection</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked premium products that showcase the finest craftsmanship
          </p>
        </motion.div>

        {/* Simple Product Showcase without circular navigation */}
        <div className="relative max-w-6xl mx-auto">
          <div className="relative flex items-center justify-center">
            {/* Central Product Display */}
            <div className="relative z-20 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    y: 50
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    y: -50
                  }}
                  transition={{ 
                    duration: 0.6, 
                    ease: "easeOut"
                  }}
                  className="grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto"
                >
                  {/* Product Image */}
                  <motion.div
                    className="relative group"
                    onHoverStart={() => setHoveredProduct(currentProduct._id)}
                    onHoverEnd={() => setHoveredProduct(null)}
                  >
                    <motion.div className="relative overflow-hidden rounded-3xl shadow-2xl">
                      <img
                        src={getImagePath(currentProduct.image)}
                        alt={currentProduct.title}
                        className="w-full h-96 md:h-[500px] object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                      />
                      
                      {/* Image Overlay - Removed on hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredProduct === currentProduct._id ? 0 : 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                      />

                      {/* Badges */}
                      <div className="absolute top-6 left-6 space-y-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                        >
                          ✨ FEATURED
                        </motion.div>
                        {currentProduct.isNew && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                          >
                            🆕 NEW
                          </motion.div>
                        )}
                        {currentProduct.discountPrice && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                          >
                            🔥 {Math.round(((currentProduct.price - currentProduct.discountPrice) / currentProduct.price) * 100)}% OFF
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* Floating Elements */}
                    <motion.div
                      animate={{ 
                        y: [0, -15, 0],
                        rotate: [0, 8, -8, 0]
                      }}
                      transition={{ 
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-full flex items-center justify-center shadow-xl"
                    >
                      <Zap className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Product Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.0, delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <motion.h2
                        className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight"
                      >
                        {currentProduct.title}
                      </motion.h2>
                      
                      {/* Product Description */}
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl"
                      >
                        {currentProduct.description || "Experience the finest craftsmanship with this exquisite piece from our featured collection. Each item is carefully selected for its unique beauty and exceptional quality."}
                      </motion.p>
                    </div>

                    {/* WhatsApp Buy Button */}
                    <motion.a
                      href={createWhatsAppLink(currentProduct)}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      <span>Buy on WhatsApp</span>
                      <ArrowRight className="w-6 h-6" />
                    </motion.a>

                    <p className="text-gray-600 text-lg">
                      Contact us at +92 300 556 7507 for instant purchase
                    </p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            {featuredProducts.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToPrev}
                  disabled={isTransitioning}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-lg p-4 rounded-full shadow-xl hover:bg-white transition-colors border border-gray-200 disabled:opacity-50 z-30"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToNext}
                  disabled={isTransitioning}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-lg p-4 rounded-full shadow-xl hover:bg-white transition-colors border border-gray-200 disabled:opacity-50 z-30"
                >
                  <ArrowRight className="w-6 h-6 text-gray-700" />
                </motion.button>
              </>
            )}
          </div>

          {/* Product Indicators */}
          {featuredProducts.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="flex justify-center mt-16 space-x-4"
            >
              {featuredProducts.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  className="relative group"
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className={`w-4 h-4 rounded-full transition-all duration-500 ${
                      index === currentIndex 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    animate={{
                      scale: index === currentIndex ? [1, 1.3, 1] : 1,
                      boxShadow: index === currentIndex 
                        ? [
                            "0 0 0px rgba(255,215,0,0)",
                            "0 0 20px rgba(255,215,0,0.8)",
                            "0 0 0px rgba(255,215,0,0)"
                          ]
                        : "0 0 0px rgba(255,215,0,0)"
                    }}
                    transition={{ 
                      scale: { duration: 2, repeat: Infinity },
                      boxShadow: { duration: 2, repeat: Infinity }
                    }}
                  />
                  
                  {/* Progress Ring */}
                  {index === currentIndex && (
                    <motion.div
                      className="absolute inset-0 w-4 h-4 border-2 border-yellow-400/50 rounded-full"
                      animate={{ rotate: 360, scale: [1, 1.5, 1] }}
                      transition={{ 
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity }
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Auto-play Toggle */}
          {featuredProducts.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="flex justify-center mt-8"
            >
              <motion.button
                onClick={() => setAutoPlay(!autoPlay)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 border backdrop-blur-sm ${
                  autoPlay 
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border-yellow-500/50 shadow-lg' 
                    : 'bg-gray-800/50 text-gray-700 border-gray-300/50 hover:bg-gray-100/50'
                }`}
              >
                {autoPlay ? '⏸️ Pause Showcase' : '▶️ Resume Showcase'}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsShowcase;