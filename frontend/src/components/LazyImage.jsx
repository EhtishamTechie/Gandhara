import { useState, useEffect, useRef } from 'react';

/**
 * LazyImage Component - Implements lazy loading with intersection observer
 * Improves page speed by only loading images when they enter the viewport
 */
const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/GandharaImages/Gandharalogo.webp',
  threshold = 0.1,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers - load image immediately
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, load it
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    // Prevent infinite loop - only set fallback once
    if (!hasError) {
      setHasError(true);
      e.target.src = placeholder;
      
      // If placeholder also fails, use a data URI as last resort
      e.target.onerror = () => {
        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="16" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Not Available%3C/text%3E%3C/svg%3E';
        e.target.onerror = null; // Prevent further errors
      };
    }
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-70'} transition-opacity duration-300`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy" // Native lazy loading as fallback
      {...props}
    />
  );
};

export default LazyImage;
