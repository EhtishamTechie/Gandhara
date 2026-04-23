'use client';
import { getImageUrl } from "../utils/imageHelper.js";

import { useEffect, useRef, useState, useCallback } from 'react';
import { ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";
import OptimizedImage from './OptimizedImage';

// Draggable horizontal scroll hook
const useDragScroll = (ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onPointerDown = useCallback((e) => {
    if (!ref.current) return;
    setIsDragging(true);
    startX.current = e.clientX || e.touches?.[0]?.clientX || 0;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.scrollBehavior = 'auto';
  }, [ref]);

  const onPointerMove = useCallback((e) => {
    if (!isDragging || !ref.current) return;
    const x = e.clientX || e.touches?.[0]?.clientX || 0;
    const walk = (startX.current - x) * 1.5;
    ref.current.scrollLeft = scrollLeft.current + walk;
  }, [isDragging, ref]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
    if (ref.current) ref.current.style.scrollBehavior = 'smooth';
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('mousedown', onPointerDown);
    el.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    return () => {
      el.removeEventListener('mousedown', onPointerDown);
      el.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [ref, onPointerDown, onPointerMove, onPointerUp]);

  return isDragging;
};

const AnimatedProductShowcase = () => {
  const [luxuryProducts, setLuxuryProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const isDragging1 = useDragScroll(row1Ref);
  const isDragging2 = useDragScroll(row2Ref);

  // Auto-scroll
  useEffect(() => {
    if (luxuryProducts.length <= 2) return;

    const row1 = row1Ref.current;
    const row2 = row2Ref.current;
    let raf;
    let paused = false;

    const step = () => {
      if (!paused) {
        if (row1) {
          row1.scrollLeft += 0.5;
          // Loop back seamlessly when reaching duplicate section
          if (row1.scrollLeft >= row1.scrollWidth / 2) {
            row1.scrollLeft = 0;
          }
        }
        if (row2) {
          row2.scrollLeft -= 0.5;
          if (row2.scrollLeft <= 0) {
            row2.scrollLeft = row2.scrollWidth / 2;
          }
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    row1?.addEventListener('mouseenter', pause);
    row1?.addEventListener('mouseleave', resume);
    row1?.addEventListener('touchstart', pause, { passive: true });
    row1?.addEventListener('touchend', resume);
    row2?.addEventListener('mouseenter', pause);
    row2?.addEventListener('mouseleave', resume);
    row2?.addEventListener('touchstart', pause, { passive: true });
    row2?.addEventListener('touchend', resume);

    return () => {
      cancelAnimationFrame(raf);
      row1?.removeEventListener('mouseenter', pause);
      row1?.removeEventListener('mouseleave', resume);
      row1?.removeEventListener('touchstart', pause);
      row1?.removeEventListener('touchend', resume);
      row2?.removeEventListener('mouseenter', pause);
      row2?.removeEventListener('mouseleave', resume);
      row2?.removeEventListener('touchstart', pause);
      row2?.removeEventListener('touchend', resume);
    };
  }, [luxuryProducts]);

  // Fetch products
  useEffect(() => {
    const fetchLuxuryProducts = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/products/category/${encodeURIComponent("Luxary Collection")}`);
        const data = await response.json();
        const productsData = Array.isArray(data) ? data : (data.products || []);
        const sortedProducts = productsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLuxuryProducts(sortedProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching luxury products:", err);
        setLoading(false);
      }
    };
    fetchLuxuryProducts();
  }, []);

  const getImagePath = (imagePath) => {
    if (!imagePath) return '/GandharaImages/Gandharalogo.webp';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return getImageUrl(imagePath);
  };

  // Scroll helpers for arrow buttons
  const scrollRow = (ref, direction) => {
    if (!ref.current) return;
    const scrollAmount = ref.current.clientWidth * 0.6;
    ref.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  // Split products for two rows
  const firstRowProducts = luxuryProducts.length <= 4 
    ? luxuryProducts 
    : luxuryProducts.slice(0, Math.ceil(luxuryProducts.length / 2));
  const secondRowProducts = luxuryProducts.length > 4 
    ? luxuryProducts.slice(Math.ceil(luxuryProducts.length / 2)) 
    : [];

  // Duplicate products for seamless loop (only when > 2 products in row)
  const dupFirst = firstRowProducts.length > 2 
    ? [...firstRowProducts, ...firstRowProducts] 
    : firstRowProducts;
  const dupSecond = secondRowProducts.length > 2 
    ? [...secondRowProducts, ...secondRowProducts] 
    : secondRowProducts;

  if (loading) {
    return (
      <section id="luxury" className="py-16 bg-[#0F172A]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6A44E]"></div>
            <p className="ml-4 text-[#F8FAFC] text-xl">Loading Luxury Collection...</p>
          </div>
        </div>
      </section>
    );
  }

  if (luxuryProducts.length === 0) {
    return (
      <section id="luxury" className="py-16 bg-[#0F172A]">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <div className="bg-[#1E293B] border-2 border-[#334155] rounded-3xl p-12 max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-[#F8FAFC] mb-4">No Luxury Products Yet</h2>
              <p className="text-[#E2E8F0]">Add products with "Luxury Collection" category in the admin panel.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="luxury" className="py-16 bg-[#0F172A]">
      <div className="container mx-auto px-4 mb-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-[#F1C27D] text-[#E6A44E] text-sm font-medium mb-3">EXCLUSIVE SELECTION</span>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent">Luxury Collection</h2>
          <p className="text-[#F8FAFC] mb-4 mx-auto">
            Discover our curated selection of premium products from around the world
          </p>
          <p className="text-[#94A3B8] text-xs">← Drag or swipe to explore →</p>
        </div>
      </div>

      <div className="mb-12 space-y-8">
        {/* First row */}
        {firstRowProducts.length > 0 && (
          <div className="relative group/row">
            {/* Left arrow */}
            <button
              onClick={() => scrollRow(row1Ref, -1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#0F172A]/80 hover:bg-[#E6A44E] text-white rounded-full p-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center"
            >
              <ChevronLeft size={24} />
            </button>

            <div
              ref={row1Ref}
              className={`flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide px-4 py-2 select-none ${isDragging1 ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
            >
              {dupFirst.map((product, i) => (
                <ProductCard
                  key={`r1-${product._id}-${i}`}
                  product={product}
                  getImagePath={getImagePath}
                  isShowcase={luxuryProducts.length <= 4}
                />
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scrollRow(row1Ref, 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#0F172A]/80 hover:bg-[#E6A44E] text-white rounded-full p-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Second row */}
        {secondRowProducts.length > 0 && (
          <div className="relative group/row">
            <button
              onClick={() => scrollRow(row2Ref, -1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#0F172A]/80 hover:bg-[#E6A44E] text-white rounded-full p-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center"
            >
              <ChevronLeft size={24} />
            </button>

            <div
              ref={row2Ref}
              className={`flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide px-4 py-2 select-none ${isDragging2 ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
            >
              {dupSecond.map((product, i) => (
                <ProductCard
                  key={`r2-${product._id}-${i}`}
                  product={product}
                  getImagePath={getImagePath}
                  isShowcase={false}
                />
              ))}
            </div>

            <button
              onClick={() => scrollRow(row2Ref, 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#0F172A]/80 hover:bg-[#E6A44E] text-white rounded-full p-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {luxuryProducts.length <= 4 && (
          <div className="text-center mt-4">
            <p className="text-[#F1C27D] text-sm italic">
              ✨ Curated Excellence - Each piece carefully selected for discerning connoisseurs
            </p>
          </div>
        )}
      </div>
      
      {/* CTA section */}
      <div className="text-center mt-14">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <a 
            href="/products" 
            className="inline-flex items-center px-8 py-3 bg-[#E6A44E] text-[#0F172A] rounded-lg hover:bg-[#F1C27D] transition-colors transform hover:scale-105 hover:shadow-xl duration-300 font-medium"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Shop Premium Collection
          </a>
          
          <a 
            href="https://wa.me/923005567507?text=Hello! I'm interested in your luxury collection products. Can you tell me more?"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105 hover:shadow-xl duration-300 font-medium"
          >
<SiWhatsapp className="w-5 h-5 mr-2 text-green-500" />
            Order on WhatsApp
          </a>
        </div>
        
        <p className="text-[#E2E8F0] text-sm mt-4">
          📞 Contact us directly: +92 300 556 7507
        </p>
      </div>
    </section>
  );
};

const ProductCard = ({ product, getImagePath, isShowcase = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const whatsappNumber = "923005567507";
  
  const createWhatsAppLink = (product) => {
    const productIdentifier = (product.slug && product.slug.trim() !== '') ? product.slug : product._id;
    const productLink = `${window.location.origin}/product/${productIdentifier}`;
    const message = `Hello, I'm interested in your product: ${product.title}\n\nProduct Link: ${productLink}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const cardClass = isShowcase
    ? 'flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] group relative transform transition-all duration-700 hover:scale-105 bg-gradient-to-br from-[#1E293B] to-[#334155] p-4 md:p-6 rounded-2xl shadow-2xl hover:shadow-[#E6A44E]/20'
    : 'flex-shrink-0 w-[240px] md:w-[280px] lg:w-[300px] group relative transform transition-all duration-500 hover:scale-105 bg-[#1E293B] p-3 md:p-4 rounded-lg shadow-xl';

  const imageHeight = isShowcase ? 'h-72 md:h-80 lg:h-96' : 'h-60 md:h-72 lg:h-80';

  return (
    <div 
      className={cardClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative ${imageHeight} overflow-hidden rounded-lg mb-3 bg-[#334155] shadow-lg`}>
        <OptimizedImage 
          src={getImagePath(product.image)} 
          alt={product.title} 
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110`}
          loading="lazy"
        />
        
        <div className={`absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
        
        {/* Category badge with showcase enhancement */}
        <div className={`absolute top-4 right-4 transition-all duration-300 ${isHovered ? 'transform -translate-y-1' : ''}`}>
          <span className={`${isShowcase ? 'bg-[#E6A44E] text-[#0F172A] px-3 py-2 text-sm font-bold' : 'bg-[#0F172A] text-[#F8FAFC] px-2 py-1 text-xs'} rounded-full shadow-md`}>
            {isShowcase ? 'EXCLUSIVE' : 'Luxury'}
          </span>
        </div>
        
        {/* Sale badge */}
        {product.discountPrice && (
          <div className={`absolute top-4 left-4 transition-all duration-300 transform ${isHovered ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'}`}>
            <div className="bg-red-500 text-white text-xs py-1 px-2 rounded-full shadow-md">
              <span>SALE</span>
            </div>
          </div>
        )}
        
        {/* Action buttons with showcase enhancement */}
        <div className="absolute bottom-0 left-0 w-full p-4 flex space-x-2 transition-all duration-500 ease-in-out transform translate-y-full group-hover:translate-y-0">
          <a 
            href={createWhatsAppLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-[#F8FAFC] text-[#0F172A] rounded-full p-3 hover:bg-[#E6A44E] hover:scale-105 transition-all duration-300 flex-1 flex items-center justify-center shadow-md ${isShowcase ? 'text-sm font-semibold' : ''}`}
          >
            <ShoppingBag className={`${isShowcase ? 'w-6 h-6' : 'w-5 h-5'} mr-2`} />
            <span className="font-medium">{isShowcase ? 'Order This Masterpiece' : 'Order on WhatsApp'}</span>
          </a>
          <button className={`bg-[#F8FAFC] text-[#0F172A] rounded-full p-3 hover:bg-[#E6A44E] hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-md ${isShowcase ? 'w-16' : 'w-12'}`}>
            <Eye className={`${isShowcase ? 'w-6 h-6' : 'w-5 h-5'}`} />
          </button>
        </div>
      </div>
      
      <h3 className={`font-bold text-[#F8FAFC] group-hover:text-[#F1C27D] transition-colors duration-300 line-clamp-2 ${isShowcase ? 'text-xl mb-3' : ''}`}>
        {product.title}
      </h3>
      
      {/* Product description with showcase enhancement */}
      {product.description && (
        <p className={`text-[#E2E8F0] mt-2 line-clamp-2 ${isShowcase ? 'text-base leading-relaxed' : 'text-sm'}`}>
          {product.description}
        </p>
      )}
      
      <div className="flex items-center justify-between mt-3">
        <span className={`text-[#E2E8F0] ${isShowcase ? 'text-sm font-medium' : 'text-xs'}`}>Premium Quality</span>
        <span className={`text-[#F1C27D] font-medium ${isShowcase ? 'text-base' : 'text-sm'}`}>
          {isShowcase ? 'Masterpiece' : 'Exclusive'}
        </span>
      </div>
    </div>
  );
};

export default AnimatedProductShowcase;
