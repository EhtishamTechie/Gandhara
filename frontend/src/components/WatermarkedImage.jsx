import React, { useMemo } from 'react';

const WatermarkedImage = ({ 
  src, 
  alt, 
  className = "",
  watermarkOpacity = 0.7,
  showLogo = true,
  showWhatsApp = true,
  whatsappNumber = "+92 300 556 7507"
}) => {
  // Compute AVIF srcset from the image URL
  const { avifSrcSet, webpSrcSet, avifBase } = useMemo(() => {
    if (!src) return { avifSrcSet: '', webpSrcSet: '', avifBase: src || '' };
    let basePath = src.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    basePath = basePath.replace('/uploads/products/', '/uploads/').replace(/\/(original|compressed|thumbnails)\//g, '/');
    return {
      avifSrcSet: `${basePath}-400w.avif 400w, ${basePath}-800w.avif 800w`,
      webpSrcSet: `${basePath}-400w.webp 400w, ${basePath}-800w.webp 800w`,
      avifBase: `${basePath}.avif`
    };
  }, [src]);

  return (
    <div className={`relative inline-block overflow-hidden watermarked-container ${className}`}>
      {/* Main Product Image with AVIF optimization */}
      <picture>
        <source type="image/avif" srcSet={avifSrcSet} sizes="(max-width: 640px) 400px, 800px" />
        <source type="image/webp" srcSet={webpSrcSet} sizes="(max-width: 640px) 400px, 800px" />
        <img
          src={avifBase}
          alt={alt}
          width={800}
          height={600}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/GandharaImages/Gandharalogo.webp';
          }}
        />
      </picture>
      
      {/* Top Right Corner Logo Watermark */}
      {showLogo && (
        <div
          className="absolute top-4 right-4 pointer-events-none z-10"
          style={{ opacity: 0.8 }}
        >
          <img
            src="/GandharaImages/Gandharalogo.webp"
            alt=""
            width={80}
            height={80}
            className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
            style={{ 
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))',
              mixBlendMode: 'overlay'
            }}
            loading="lazy"
          />
        </div>
      )}
      
      {/* WhatsApp Number Watermark */}
      {showWhatsApp && (
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-10"
          style={{ opacity: watermarkOpacity }}
        >
          <div
            className="text-white font-bold select-none text-center"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              letterSpacing: '0.2em',
              fontSize: 'clamp(20px, 2.5vw, 26px)'
            }}
          >
            {whatsappNumber}
          </div>
        </div>
      )}
      
      {/* Diagonal Text Watermark - uses CSS pseudo-element via .watermarked-container::after in index.css */}
    </div>
  );
};

export default WatermarkedImage;
