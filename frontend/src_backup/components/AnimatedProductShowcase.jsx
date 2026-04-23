'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";

const AnimatedProductShowcase = () => {
  const [luxuryProducts, setLuxuryProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // References for both carousel rows
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);

  // Fetch products that are marked as "Luxury Collection" by admin
  useEffect(() => {
    const fetchLuxuryProducts = async () => {
      try {
        setLoading(true);
        // Using fetch instead of axios for compatibility
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/category/${encodeURIComponent("Luxary Collection")}`);

        const data = await response.json();
        
        // Sort by creation date (newest first)
        const sortedProducts = data.sort(
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

  // Get image path function
  const getImagePath = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    return `${import.meta.env.VITE_API_URL}/${imagePath}`;
  };

  useEffect(() => {
    if (luxuryProducts.length > 0) {
      const animateCarousel = () => {
        if (row1Ref.current && row2Ref.current) {
          
          // Adaptive animation speed based on product count
          const getAnimationDuration = (productCount) => {
            if (productCount <= 3) return 25000; // Slower for few products - let people appreciate each one
            if (productCount <= 6) return 35000; // Medium speed
            return 50000; // Slower for many products - give time to browse
          };

          const animationDuration = getAnimationDuration(luxuryProducts.length);
          
          // For few products (1-4), use gentle floating instead of scrolling
          if (luxuryProducts.length <= 4) {
            // Gentle floating animation for showcase effect
            const floatingAnimation1 = row1Ref.current.animate([
              { transform: 'translateX(0) translateY(0)' },
              { transform: 'translateX(-2%) translateY(-8px)' },
              { transform: 'translateX(0) translateY(0)' },
              { transform: 'translateX(2%) translateY(8px)' },
              { transform: 'translateX(0) translateY(0)' }
            ], {
              duration: animationDuration,
              iterations: Infinity,
              easing: 'ease-in-out'
            });

            const floatingAnimation2 = row2Ref.current.animate([
              { transform: 'translateX(0) translateY(8px)' },
              { transform: 'translateX(2%) translateY(0)' },
              { transform: 'translateX(0) translateY(-8px)' },
              { transform: 'translateX(-2%) translateY(0)' },
              { transform: 'translateX(0) translateY(8px)' }
            ], {
              duration: animationDuration,
              iterations: Infinity,
              easing: 'ease-in-out'
            });

            // Pause on hover
            const handleMouseEnter = () => {
              floatingAnimation1.pause();
              floatingAnimation2.pause();
            };

            const handleMouseLeave = () => {
              floatingAnimation1.play();
              floatingAnimation2.play();
            };

            row1Ref.current.addEventListener('mouseenter', handleMouseEnter);
            row1Ref.current.addEventListener('mouseleave', handleMouseLeave);
            row2Ref.current.addEventListener('mouseenter', handleMouseEnter);
            row2Ref.current.addEventListener('mouseleave', handleMouseLeave);

            return () => {
              floatingAnimation1.cancel();
              floatingAnimation2.cancel();
              if (row1Ref.current) {
                row1Ref.current.removeEventListener('mouseenter', handleMouseEnter);
                row1Ref.current.removeEventListener('mouseleave', handleMouseLeave);
              }
              if (row2Ref.current) {
                row2Ref.current.removeEventListener('mouseenter', handleMouseEnter);
                row2Ref.current.removeEventListener('mouseleave', handleMouseLeave);
              }
            };
          } else {
            // Traditional scrolling for many products
            const animation1 = row1Ref.current.animate([
              { transform: 'translateX(0)' },
              { transform: 'translateX(-50%)' }
            ], {
              duration: animationDuration,
              iterations: Infinity,
              easing: 'linear'
            });
            
            const animation2 = row2Ref.current.animate([
              { transform: 'translateX(-50%)' },
              { transform: 'translateX(0)' }
            ], {
              duration: animationDuration,
              iterations: Infinity,
              easing: 'linear'
            });

            // Enhanced scroll behavior
            const handleMouseEnter = () => {
              animation1.pause();
              animation2.pause();
            };

            const handleMouseLeave = () => {
              animation1.play();
              animation2.play();
            };

            // Intelligent scroll amount based on product count
            const getScrollAmount = (productCount) => {
              if (productCount <= 8) return 250; // Smaller jumps for fewer products
              if (productCount <= 15) return 350; // Medium jumps
              return 450; // Larger jumps for many products
            };

            const handleWheel = (e) => {
              e.preventDefault();
              const scrollAmount = e.deltaY > 0 ? getScrollAmount(luxuryProducts.length) : -getScrollAmount(luxuryProducts.length);
              
              if (e.currentTarget === row1Ref.current) {
                row1Ref.current.scrollLeft += scrollAmount;
              } else if (e.currentTarget === row2Ref.current) {
                row2Ref.current.scrollLeft += scrollAmount;
              }
            };

            row1Ref.current.addEventListener('mouseenter', handleMouseEnter);
            row1Ref.current.addEventListener('mouseleave', handleMouseLeave);
            row1Ref.current.addEventListener('wheel', handleWheel, { passive: false });
            
            row2Ref.current.addEventListener('mouseenter', handleMouseEnter);
            row2Ref.current.addEventListener('mouseleave', handleMouseLeave);
            row2Ref.current.addEventListener('wheel', handleWheel, { passive: false });

            return () => {
              animation1.cancel();
              animation2.cancel();
              if (row1Ref.current) {
                row1Ref.current.removeEventListener('mouseenter', handleMouseEnter);
                row1Ref.current.removeEventListener('mouseleave', handleMouseLeave);
                row1Ref.current.removeEventListener('wheel', handleWheel);
              }
              if (row2Ref.current) {
                row2Ref.current.removeEventListener('mouseenter', handleMouseEnter);
                row2Ref.current.removeEventListener('mouseleave', handleMouseLeave);
                row2Ref.current.removeEventListener('wheel', handleWheel);
              }
            };
          }
        }
      };

      const cleanup = animateCarousel();
      return cleanup;
    }
  }, [luxuryProducts]);

  // Intelligent layout based on product count
  const getLayoutConfig = (productCount) => {
    if (productCount <= 2) {
      return {
        cardWidth: 'w-96', // Larger cards for showcase
        spacing: 'space-x-12', // More spacing
        containerClass: 'justify-center', // Center align
        scrollHint: 'Hover to pause showcase',
        showDuplicates: false
      };
    } else if (productCount <= 4) {
      return {
        cardWidth: 'w-80',
        spacing: 'space-x-8',
        containerClass: 'justify-center',
        scrollHint: 'Hover to explore each piece',
        showDuplicates: false
      };
    } else if (productCount <= 8) {
      return {
        cardWidth: 'w-72',
        spacing: 'space-x-6',
        containerClass: '',
        scrollHint: 'Scroll to discover more',
        showDuplicates: true
      };
    } else {
      return {
        cardWidth: 'w-64', // Smaller cards for many products
        spacing: 'space-x-4', // Tighter spacing
        containerClass: '',
        scrollHint: 'Scroll through our extensive collection',
        showDuplicates: true
      };
    }
  };

  const layoutConfig = getLayoutConfig(luxuryProducts.length);

  // Split products for two rows (adaptive)
  const getRowSplit = (products, count) => {
    if (count <= 4) {
      // For few products, put them all in first row for better showcase
      return {
        firstRow: products,
        secondRow: []
      };
    } else {
      // For many products, split evenly
      return {
        firstRow: products.slice(0, Math.ceil(products.length / 2)),
        secondRow: products.slice(Math.ceil(products.length / 2))
      };
    }
  };

  const { firstRow: firstRowProducts, secondRow: secondRowProducts } = getRowSplit(luxuryProducts, luxuryProducts.length);

  if (loading) {
    return (
      <section id="luxury" className="py-16 overflow-hidden bg-[#0F172A]">
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
      <section id="luxury" className="py-16 overflow-hidden bg-[#0F172A]">
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
    <section id="luxury" className="py-16 overflow-hidden bg-[#0F172A]"> 
      <div className="container mx-auto px-4 mb-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-[#F1C27D] text-[#E6A44E] text-sm font-medium mb-3">EXCLUSIVE SELECTION</span>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent">Luxury Collection</h2>
          <p className="text-[#F8FAFC] mb-12 mx-auto">
            Discover our curated selection of premium products from around the world
          </p>
        </div>
      </div>

      {/* Main animated product rows */}
      <div className="mb-12">
        {/* First row - adaptive behavior */}
        {firstRowProducts.length > 0 && (
          <div className="relative overflow-hidden py-2">
            <div 
              ref={row1Ref} 
              className={`flex ${layoutConfig.containerClass} ${luxuryProducts.length > 4 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
              style={{
                width: layoutConfig.showDuplicates ? '200%' : '100%',
                display: 'flex',
                scrollBehavior: 'smooth'
              }}
            >
              {/* First set */}
              <div className={`flex ${layoutConfig.spacing} px-4`} style={{ width: layoutConfig.showDuplicates ? '100%' : 'auto' }}>
                {firstRowProducts.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    getImagePath={getImagePath}
                    cardWidth={layoutConfig.cardWidth}
                    isShowcase={luxuryProducts.length <= 4}
                  />
                ))}
              </div>
              
              {/* Duplicate set for seamless loop - only for many products */}
              {layoutConfig.showDuplicates && (
                <div className={`flex ${layoutConfig.spacing} px-4`} style={{ width: '100%' }}>
                  {firstRowProducts.map(product => (
                    <ProductCard 
                      key={`dup1-${product._id}`} 
                      product={product} 
                      getImagePath={getImagePath}
                      cardWidth={layoutConfig.cardWidth}
                      isShowcase={false}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Adaptive scroll hint */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-[#E2E8F0] text-xs opacity-60 pointer-events-none">
              {layoutConfig.scrollHint}
            </div>
          </div>
        )}

        {/* Second row - only for many products */}
        {secondRowProducts.length > 0 && (
          <div className="relative overflow-hidden mt-10 py-2">
            <div 
              ref={row2Ref} 
              className="flex cursor-grab active:cursor-grabbing"
              style={{
                width: '200%',
                display: 'flex',
                scrollBehavior: 'smooth'
              }}
            >
              {/* First set */}
              <div className={`flex ${layoutConfig.spacing} px-4`} style={{ width: '100%' }}>
                {secondRowProducts.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    getImagePath={getImagePath}
                    cardWidth={layoutConfig.cardWidth}
                    isShowcase={false}
                  />
                ))}
              </div>
              
              {/* Duplicate set for seamless loop */}
              <div className={`flex ${layoutConfig.spacing} px-4`} style={{ width: '100%' }}>
                {secondRowProducts.map(product => (
                  <ProductCard 
                    key={`dup2-${product._id}`} 
                    product={product} 
                    getImagePath={getImagePath}
                    cardWidth={layoutConfig.cardWidth}
                    isShowcase={false}
                  />
                ))}
              </div>
            </div>
            
            {/* Scroll hint */}
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-[#E2E8F0] text-xs opacity-60 pointer-events-none">
              {layoutConfig.scrollHint}
            </div>
          </div>
        )}

        {/* Special showcase message for few products */}
        {luxuryProducts.length <= 4 && (
          <div className="text-center mt-8">
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

const ProductCard = ({ product, getImagePath, cardWidth = 'w-72', isShowcase = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // WhatsApp number - updated to your number
  const whatsappNumber = "923005567507";
  
  // Create WhatsApp message with product information
  const createWhatsAppLink = (product) => {
    const message = `Hello! I'm interested in ordering: ${product.title}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  // Showcase cards have enhanced animations and larger size
  const showcaseEnhancements = isShowcase ? {
    cardClass: `${cardWidth} group relative transform transition-all duration-700 hover:scale-110 bg-gradient-to-br from-[#1E293B] to-[#334155] p-6 rounded-2xl shadow-2xl hover:shadow-[#E6A44E]/20`,
    imageHeight: 'h-96',
    imageClass: 'transition-transform duration-1000 group-hover:scale-125',
    overlayClass: 'bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/20 to-transparent'
  } : {
    cardClass: `flex-shrink-0 ${cardWidth} group relative transform transition-all duration-500 hover:scale-105 bg-[#1E293B] p-4 rounded-lg shadow-xl`,
    imageHeight: 'h-80',
    imageClass: 'transition-transform duration-700 group-hover:scale-110',
    overlayClass: 'bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/10 to-transparent'
  };

  return (
    <div 
      className={showcaseEnhancements.cardClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative ${showcaseEnhancements.imageHeight} overflow-hidden rounded-lg mb-3 bg-[#334155] shadow-lg`}>
        <img 
          src={getImagePath(product.image)} 
          alt={product.title} 
          className={`w-full h-full object-cover ${showcaseEnhancements.imageClass}`}
          onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
        />
        
        <div className={`absolute inset-0 ${showcaseEnhancements.overlayClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
        
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