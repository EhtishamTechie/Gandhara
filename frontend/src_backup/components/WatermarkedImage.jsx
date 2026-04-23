import React from 'react';

const WatermarkedImage = ({ 
  src, 
  alt, 
  className = "",
  watermarkOpacity = 0.4,
  showLogo = true,
  showWhatsApp = true,
  whatsappNumber = "+92 300 556 7507"
}) => {
  
  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      {/* Main Product Image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/placeholder-image.png';
        }}
      />
      
      {/* Top Right Corner Logo Watermark - High Opacity */}
      {showLogo && (
        <div
          className="absolute top-4 right-4 pointer-events-none z-10"
          style={{ opacity: 0.8 }} // High opacity
        >
          <img
            src="/GandharaImages/Gandharalogo.png"
            alt="Gandhara Arts and Taxila Stone Crafts"
            className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
            style={{ 
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))',
              mixBlendMode: 'overlay'
            }}
          />
        </div>
      )}
      
      {/* WhatsApp Number Watermark - Centered and Bigger */}
      {showWhatsApp && (
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-10"
          style={{ opacity: watermarkOpacity * 0.8 }}
        >
          <div
            className="text-white font-bold select-none text-center"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              letterSpacing: '0.2em',
              fontSize: 'clamp(14px, 2vw, 18px)' // Bigger font size
            }}
          >
            {whatsappNumber}
          </div>
        </div>
      )}
      
      {/* Company Name Watermark - Removed */}
      
      {/* Optional: Diagonal Text Watermark - Subtle */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        style={{ opacity: watermarkOpacity * 0.3 }} // Much more subtle
      >
        <div
          className="text-white font-bold transform rotate-12 select-none text-center"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            letterSpacing: '0.2em',
            fontSize: 'clamp(10px, 1.5vw, 14px)' // Much smaller font size
          }}
        >
          GANDHARA ARTS<br />
          TAXILA STONE CRAFTS.COM
        </div>
      </div>
    </div>
  );
};

export default WatermarkedImage;