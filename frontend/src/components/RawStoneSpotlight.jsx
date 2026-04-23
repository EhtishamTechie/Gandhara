import React, { useState, useEffect } from 'react';
import { getImageUrl } from "../utils/imageHelper.js";
import { useInView } from 'react-intersection-observer';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const RawStoneSpotlight = () => {
  const [rawStoneProducts, setRawStoneProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products that are marked as "Raw Stone" by admin
  useEffect(() => {
    const fetchRawStoneProducts = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/products/category/Raw Stone`);
        const data = await response.json();
        
        // Handle both array and object responses
        const productsData = Array.isArray(data) ? data : (data.products || []);
        
        // Sort by creation date (newest first) and limit to 5 products
        const sortedProducts = productsData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        
        setRawStoneProducts(sortedProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching raw stone products:", err);
        setLoading(false);
      }
    };

    fetchRawStoneProducts();
  }, []);

  // Get image path function
  const getImagePath = (imagePath) => {
    if (!imagePath) return '/GandharaImages/Gandharalogo.webp';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    return getImageUrl(imagePath);

  };

  const { ref: headingRef, inView: headingInView } = useInView({ 
    triggerOnce: true, 
    threshold: 0.1 
  });

  if (loading) {
    return (
      <section className="bg-[#0F172A] py-20 md:py-28">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6A44E]"></div>
            <p className="ml-4 text-[#F8FAFC] text-xl">Loading Raw Stone Collection...</p>
          </div>
        </div>
      </section>
    );
  }

  if (rawStoneProducts.length === 0) {
    return (
      <section className="bg-[#0F172A] py-20 md:py-28">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="bg-[#1E293B] border-2 border-[#334155] rounded-3xl p-12 max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-[#F8FAFC] mb-4">No Raw Stone Products Yet</h2>
              <p className="text-[#E2E8F0]">Add products with "Raw Stone" category in the admin panel.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#0F172A] py-20 md:py-28 overflow-x-hidden">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headingRef}
          className={`text-center mb-16 md:mb-20 transition-all duration-700 ease-out ${
            headingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent mb-4 tracking-tight">
            The Soul of Stone
          </h2>
          <p className="text-lg md:text-xl text-[#F8FAFC] max-w-2xl mx-auto leading-relaxed">
            Explore the origins and unique characteristics of our exceptional raw stone materials.
          </p>
        </div>

        {/* Raw Stone Products Loop */}
        <div className="space-y-20 md:space-y-24">
          {rawStoneProducts.map((product, index) => (
            <RawStoneBlock key={product._id} product={product} index={index} getImagePath={getImagePath} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Individual Raw Stone Block Component
const RawStoneBlock = ({ product, index, getImagePath }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const imageIsOnLeft = index % 2 === 0;
  const initialTranslate = imageIsOnLeft ? 'sm:-translate-x-10' : 'sm:translate-x-10';

  // WhatsApp number
  const whatsappNumber = "923005567507";
  
  // Create WhatsApp message with product information
  const createWhatsAppLink = (product) => {
    const message = `Hello! I'm interested in this raw stone: ${product.title}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center transition-all duration-1000 ease-out ${
        inView ? 'opacity-100 translate-y-0 sm:translate-x-0' : `opacity-0 translate-y-10 ${initialTranslate}`
      }`}
    >
      {/* Visual Column */}
      <div className={`w-full ${!imageIsOnLeft ? 'md:order-last' : ''}`}>
        <div className="group relative overflow-hidden rounded-xl shadow-2xl aspect-[4/5] bg-[#334155]">
          <img
            src={getImagePath(product.image)}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = '/GandharaImages/Gandharalogo.webp'; }}
          />
          
          {/* Sale badge if discounted */}
          {product.discountPrice && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
              SALE
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute top-4 left-4 bg-[#E6A44E] text-[#0F172A] text-sm font-bold px-3 py-1 rounded-full shadow-lg">
            Raw Stone
          </div>
        </div>
      </div>

      {/* Text Column */}
      <div className="text-center md:text-left py-4">
        <h3 className="text-3xl md:text-4xl font-semibold text-[#F8FAFC] mb-3 tracking-tight">
          {product.title}
        </h3>
        
        <p className="text-[#E2E8F0] text-base md:text-lg leading-relaxed mb-6">
          {product.description || "Experience the natural beauty and unique characteristics of this exceptional raw stone, carefully selected for its quality and distinctive features."}
        </p>
        
        {/* Categories if available */}
        {product.categories && product.categories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {product.categories.slice(0, 3).map((category, idx) => (
                <span 
                  key={idx}
                  className="text-xs bg-[#1E293B] text-[#F1C27D] px-2 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          {/* WhatsApp Button */}
          <a
            href={createWhatsAppLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-x-2 bg-[#E6A44E] hover:bg-[#F1C27D] text-[#0F172A] font-semibold px-7 py-3 rounded-lg transition-all duration-300 ease-in-out text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#F1C27D] focus:ring-offset-2 focus:ring-offset-[#0F172A]"
            aria-label={`Get information about ${product.title} via WhatsApp`}
          >
            Discover This Stone
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </a>
          
          {/* Learn More Button */}
          {/* <button className="inline-flex items-center gap-x-2 bg-transparent border-2 border-[#F1C27D] hover:bg-[#F1C27D] hover:text-[#0F172A] text-[#F1C27D] font-semibold px-7 py-3 rounded-lg transition-all duration-300 ease-in-out text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Learn More
            <ArrowRightIcon className="w-5 h-5" />
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default RawStoneSpotlight;
