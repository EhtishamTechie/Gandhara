'use client';
import { getImageUrl } from "../utils/imageHelper.js";
import { buildProductWhatsAppUrl } from '../utils/whatsappHelper';
import logger from '../utils/logger';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ShoppingCart, Heart, Eye, ArrowRight, ArrowLeft, Star, Sparkles, Zap } from 'lucide-react';
import axios from 'axios';
import OptimizedImage from './OptimizedImage';
import '../styles/animations.css';

const FeaturedProductsShowcase = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const [cornerSoldOut, setCornerSoldOut] = useState(null);
  const prevSpotlightIdRef = useRef(null);

  // WhatsApp number - updated to your number
  const whatsappNumber = "923005567507";
  
  const createWhatsAppLink = (product) =>
    buildProductWhatsAppUrl(product, whatsappNumber);

  // Get image path function
  const getImagePath = (imagePath) => {
    if (!imagePath) return '/GandharaImages/Gandharalogo.webp';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
   return getImageUrl(imagePath);
  };

  // Fetch products that are marked as featuredProducts by admin
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/products/category/featuredProducts`);
        
        // Handle both array and object responses
        const productsData = Array.isArray(response.data) ? response.data : (response.data.products || []);
        
        // Sort by creation date (newest first)
        const sortedProducts = productsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setFeaturedProducts(sortedProducts);
        setLoading(false);
      } catch (err) {
        logger.error("Error fetching featured products:", err);
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
    const interval = setInterval(fetchFeaturedProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  const sortedFeatured = useMemo(() => {
    const now = Date.now();
    return [...featuredProducts].sort((a, b) => {
      const aUntil = a?.featuredUntil ? new Date(a.featuredUntil).getTime() : 0;
      const bUntil = b?.featuredUntil ? new Date(b.featuredUntil).getTime() : 0;
      const aFuture = aUntil > now ? 1 : 0;
      const bFuture = bUntil > now ? 1 : 0;

      if (aFuture !== bFuture) return bFuture - aFuture;
      if (aFuture && bFuture && aUntil !== bUntil) return bUntil - aUntil;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [featuredProducts]);

  const prominentIndex = useMemo(() => {
    const now = Date.now();
    const inWindow = sortedFeatured.findIndex(
      (p) => !p?.isSoldOut && p?.featuredUntil && new Date(p.featuredUntil).getTime() > now
    );
    if (inWindow >= 0) return inWindow;
    const anyUnsold = sortedFeatured.findIndex((p) => !p?.isSoldOut);
    if (anyUnsold >= 0) return anyUnsold;
    return 0;
  }, [sortedFeatured]);

  useEffect(() => {
    if (!sortedFeatured.length) return;
    if (currentIndex !== prominentIndex) setCurrentIndex(prominentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prominentIndex, sortedFeatured.length]);

  // If the spotlight item changes and the previous spotlight is now sold out,
  // keep it visible as a small "corner" card.
  useEffect(() => {
    const current = sortedFeatured[currentIndex];
    const currentId = current?._id || current?.slug || String(currentIndex);

    const prevId = prevSpotlightIdRef.current;
    if (prevId && prevId !== currentId) {
      const prev = sortedFeatured.find((p, idx) => (p?._id || p?.slug || String(idx)) === prevId);
      if (prev?.isSoldOut) {
        setCornerSoldOut(prev);
      }
    }
    prevSpotlightIdRef.current = currentId;
  }, [currentIndex, sortedFeatured]);

  // Premium navigation functions with smooth transitions
  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedFeatured.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + sortedFeatured.length) % sortedFeatured.length);
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
      <section id="collections" className="relative min-h-screen bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gray-50/30" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div
            className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-rotate"
          />
          <p
            className="ml-4 text-black text-xl font-semibold animate-pulse"
          >
            Loading Featured Products...
          </p>
        </div>
      </section>
    );
  }

  if (sortedFeatured.length === 0) {
    return (
      <section id="collections" className="relative min-h-screen bg-white overflow-hidden">
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

  const currentProduct = sortedFeatured[currentIndex];

  // Enhanced single product showcase
  if (sortedFeatured.length === 1) {
    return (
      <section id="collections" className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 overflow-hidden">
        {/* Artistic Background Elements */}
        <div className="absolute inset-0">
          {/* Golden Rays */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`ray-${i}`}
              className="absolute w-1 bg-gradient-to-t from-transparent via-yellow-600/30 to-transparent animate-sway"
              style={{
                height: '120vh',
                left: `${20 + i * 10}%`,
                top: '-10vh',
                transformOrigin: 'bottom center',
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
          
          {/* Floating Particles */}
          {[...Array(25)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-3 h-3 bg-yellow-600/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${12 + Math.random() * 8}s`
              }}
            />
          ))}
        </div>

        {/* Main Showcase */}
        <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex items-center">
          <div className="w-full">
            {/* Majestic Header */}
            <div
              className="text-center mb-20 animate-fadeInUp"
            >
              <div
                className="inline-block mb-8 animate-rotate-slow"
              >
                <div className="relative">
                  <Sparkles className="w-20 h-20 text-yellow-600" />
                  <div
                    className="absolute inset-0 w-20 h-20 bg-yellow-600/30 rounded-full blur-xl animate-pulse"
                  />
                </div>
              </div>
              
              <h1 
                className="text-6xl md:text-8xl font-bold mb-6 animate-fadeIn"
              >
                <span 
                  className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-700 bg-clip-text text-transparent"
                >
                  MASTERPIECE
                </span>
              </h1>
              
              <p
                className="text-2xl text-gray-700 max-w-3xl mx-auto font-light animate-fadeInUp animation-delay-300"
              >
                Experience the pinnacle of artisan craftsmanship
              </p>
            </div>

            {/* Product Showcase */}
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
              {/* Product Image - Left Side */}
              <div
                className="relative animate-fadeInUp animation-delay-500"
              >
                {/* Ornate Frame */}
                <div
                  className="relative p-8 bg-gradient-to-br from-yellow-100 via-white to-yellow-50 rounded-[3rem] shadow-2xl border-4 border-yellow-600/30 hover-lift"
                >
                  <div className="relative overflow-hidden rounded-[2rem]">
                    <OptimizedImage
                      src={getImagePath(currentProduct.image)}
                      alt={currentProduct.title}
                      className="w-full h-[600px] object-cover hover-scale smooth-transition"
                      loading="lazy"
                    />
                    
                    {/* Magical Overlay */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-600/10 to-transparent animate-shimmer"
                    />
                  </div>
                  
                  {/* Decorative Corner Elements */}
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={`corner-${i}`}
                      className={`absolute w-6 h-6 border-4 border-yellow-600 animate-pulse ${
                        i === 0 ? 'top-2 left-2 border-r-0 border-b-0' :
                        i === 1 ? 'top-2 right-2 border-l-0 border-b-0' :
                        i === 2 ? 'bottom-2 left-2 border-r-0 border-t-0' :
                        'bottom-2 right-2 border-l-0 border-t-0'
                      }`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>

                {/* Floating Badge */}
                <div
                  className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-6 py-3 rounded-full shadow-2xl border-4 border-white animate-bounce-slow"
                >
                  <span className="font-bold text-lg">EXCLUSIVE</span>
                </div>
              </div>

              {/* Product Details - Right Side */}
              <div
                className="space-y-8 animate-fadeInUp animation-delay-700"
              >
                <h2
                  className="text-5xl md:text-6xl font-bold text-black leading-tight"
                >
                  {currentProduct.title}
                </h2>
                
                <div
                  className="h-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full animate-expandWidth"
                />
                
                <p
                  className="text-xl text-gray-700 leading-relaxed max-w-2xl animate-fadeInUp animation-delay-900"
                >
                  {currentProduct.description || "A testament to timeless artistry and unparalleled craftsmanship. This exceptional piece represents the perfect fusion of traditional techniques and contemporary elegance, destined to become a cherished heirloom for generations to come."}
                </p>

                {/* Call to Action */}
                <div
                  className="pt-8 animate-fadeInUp"
                  style={{ animationDelay: '1.2s' }}
                >
                  <a
                    href={createWhatsAppLink(currentProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center space-x-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-6 rounded-2xl text-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 hover-scale"
                  >
                    <div
                      className="animate-rotate-slow"
                    >
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <span>Acquire This Masterpiece</span>
                    <div
                      className="animate-pulse-slow"
                    >
                      <ArrowRight className="w-8 h-8" />
                    </div>
                  </a>
                  
                  <p
                    className="text-gray-600 text-lg mt-6 font-medium animate-fadeIn animation-delay-300"
                  >
                    📞 Connect instantly: +92 300 556 7507
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="collections" className="relative min-h-screen bg-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-600/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${6 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12" ref={containerRef}>
        {/* Header */}
        <div
          className="text-center mb-16 animate-fadeInUp"
        >
          <div
            className="inline-block mb-6 animate-rotate-slow"
          >
            <Sparkles className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-4">
            <span className="bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
              Limited Spotlight
            </span>
            <br />
            <span className="text-black">Best-Sellers Ready to Ship</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            One masterpiece at a time. When it’s sold out, we reveal the next — claim yours now on WhatsApp.
          </p>
        </div>

        {/* Featured spotlight + side rail */}
        <div className="relative max-w-6xl mx-auto">
          {cornerSoldOut && (
            <div className="absolute -top-6 right-4 z-30 w-56">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="relative">
                  <img
                    src={getImagePath(cornerSoldOut.image)}
                    alt={cornerSoldOut.title}
                    className="w-full h-28 object-cover grayscale"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    SOLD OUT
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs font-semibold text-gray-900 line-clamp-2">
                    {cornerSoldOut.title}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[11px] text-gray-600">
                      ${Number(cornerSoldOut.price || 0).toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCornerSoldOut(null)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-800"
                    >
                      Hide
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Main Spotlight */}
            <div className="lg:col-span-2">
              <div
                key={currentIndex}
                className="grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto animate-fadeIn"
              >
                {/* Product Image */}
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                    <OptimizedImage
                      src={getImagePath(currentProduct.image)}
                      alt={currentProduct.title}
                      className={`w-full h-96 md:h-[500px] object-cover smooth-transition hover-scale ${
                        currentProduct.isSoldOut ? 'grayscale' : ''
                      }`}
                      loading="lazy"
                    />

                    {/* Badges */}
                    <div className="absolute top-6 left-6 space-y-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-scaleIn">
                        ✨ FEATURED
                      </div>
                      {currentProduct.isSoldOut && (
                        <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-scaleIn animation-delay-50">
                          SOLD OUT
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-full flex items-center justify-center shadow-xl animate-bounce-slow">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6 animate-fadeInUp animation-delay-300">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
                      {currentProduct.title}
                    </h2>

                    <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl animate-fadeInUp animation-delay-500">
                      {currentProduct.description || "Experience the finest craftsmanship with this exquisite piece from our featured collection. Each item is carefully selected for its unique beauty and exceptional quality."}
                    </p>
                  </div>

                  <a
                    href={createWhatsAppLink(currentProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center space-x-3 px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl transition-all duration-300 hover-scale ${
                      currentProduct.isSoldOut
                        ? 'bg-gray-400 text-white cursor-not-allowed pointer-events-none'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/25'
                    }`}
                    aria-disabled={currentProduct.isSoldOut}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span>{currentProduct.isSoldOut ? 'Sold out' : 'Buy on WhatsApp'}</span>
                    {!currentProduct.isSoldOut && <ArrowRight className="w-6 h-6" />}
                  </a>

                  <p className="text-gray-600 text-lg">
                    Contact us at +92 300 556 7507 for instant purchase
                  </p>
                </div>
              </div>
            </div>

            {/* Side rail: sold items shrink here, next item becomes spotlight */}
            <aside className="lg:col-span-1 bg-gray-50 border border-gray-200 rounded-3xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                Next products
              </h3>
              <div className="space-y-3">
                {sortedFeatured
                  .map((p, idx) => ({ p, idx }))
                  .filter(({ idx }) => idx !== currentIndex)
                  .slice(0, 8)
                  .map(({ p, idx }) => (
                    <button
                      key={p._id || idx}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      disabled={isTransitioning}
                      className="w-full text-left group flex gap-3 items-center p-3 rounded-2xl bg-white border border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all disabled:opacity-50"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={getImagePath(p.image)}
                          alt={p.title}
                          className={`w-full h-full object-cover ${p.isSoldOut ? 'grayscale' : ''}`}
                          loading="lazy"
                        />
                        {p.isSoldOut && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="text-[10px] font-bold text-white px-2 py-1 rounded-full bg-black/60">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-yellow-700">
                          {p.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ${Number(p.price || 0).toFixed(2)}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsShowcase;
