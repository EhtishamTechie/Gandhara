import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ImageLoader } from '../utils/imageLoader';

const OptimizedImage = ({
  src,
  alt = '',
  width = 1200,
  height = 1200,
  className = '',
  lazy = true,
  priority = false,
  sizes = null,
  maxWidth = null, // Maximum width of original image (auto-detect from filename if null)
  objectFit = 'cover',
  onLoad = () => {},
  onError = () => {},
  draggable = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const errorAttempts = useRef(0);

  // Auto-detect maxWidth: bulk products are 565px, others assume 1600px
  const detectedMaxWidth = maxWidth || (src && src.includes('bulk_') ? 565 : 1600);

  // Memoize srcsets and sizes to prevent IntersectionObserver recreation on every render
  const avifSrcSet = useMemo(
    () => (src ? ImageLoader.generateAVIFSrcSet(src, detectedMaxWidth) : ''),
    [src, detectedMaxWidth]
  );
  const webpSrcSet = useMemo(
    () => (src ? ImageLoader.generateWebPSrcSet(src, detectedMaxWidth) : ''),
    [src, detectedMaxWidth]
  );
  // 800w AVIF — the largest variant guaranteed to exist on this server
  const avif800Src = useMemo(() => {
    if (!src) return src || '';
    const basePath = src.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    return basePath.replace('/uploads/products/', '/uploads/').replace(/\/(original|compressed|thumbnails)\//g, '/') + '-800w.avif';
  }, [src]);

  // 400w AVIF — smallest guaranteed variant (fallback)
  const avif400Src = useMemo(() => {
    if (!src) return '';
    const basePath = src.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    return basePath.replace('/uploads/products/', '/uploads/').replace(/\/(original|compressed|thumbnails)\//g, '/') + '-400w.avif';
  }, [src]);

  const [currentSrc, setCurrentSrc] = useState(avif800Src);

  // Reset when src prop changes
  useEffect(() => {
    setCurrentSrc(avif800Src);
    errorAttempts.current = 0;
    setHasError(false);
    setIsLoaded(false);
  }, [avif800Src]);
  
  const sizesAttr = useMemo(
    () => ImageLoader.generateSizes(sizes, detectedMaxWidth),
    [sizes, detectedMaxWidth]
  );

  useEffect(() => {
    if (!src) return;

    // Preload priority images — use 800w (guaranteed to exist)
    if (priority && !lazy) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = ImageLoader.getOptimizedUrl(src, 'medium', 'avif');
      link.type = 'image/avif';
      link.imageSrcset = avifSrcSet;
      link.imageSizes = sizesAttr;
      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }

    // Set up lazy loading with IntersectionObserver
    if (lazy && imgRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Image is in viewport, browser will load it automatically
              if (observerRef.current && imgRef.current) {
                observerRef.current.unobserve(imgRef.current);
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );

      observerRef.current.observe(imgRef.current);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [src, lazy, priority, avifSrcSet, sizesAttr]);

  // Handle load event
  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad(e);
  };

  // Guard: if the image was served from cache, 'load' fires before React attaches onLoad.
  // Check img.complete after mount so the image isn't stuck invisible.
  useEffect(() => {
    if (imgRef.current?.complete && !isLoaded) {
      setIsLoaded(true);
    }
  });

  // Handle error event — fallback chain: 800w → 400w → logo
  const handleError = (e) => {
    if (errorAttempts.current === 0) {
      // 800w failed, try 400w
      errorAttempts.current = 1;
      setCurrentSrc(avif400Src);
    } else if (errorAttempts.current === 1) {
      // 400w failed, use logo
      errorAttempts.current = 2;
      setCurrentSrc('/GandharaImages/Gandharalogo.webp');
    } else {
      setHasError(true);
      onError(e);
    }
  };

  // Show placeholder while loading or on error
  if (!src || hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          aspectRatio: `${width} / ${height}`,
        }}
        {...props}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <picture className="block w-full h-full">
      {/* AVIF source (best compression - 30-50% smaller than WebP) */}
      {avifSrcSet && (
        <source
          type="image/avif"
          srcSet={avifSrcSet}
          sizes={sizesAttr}
        />
      )}

      {/* WebP source (fallback for browsers without AVIF support) */}
      {webpSrcSet && (
        <source
          type="image/webp"
          srcSet={webpSrcSet}
          sizes={sizesAttr}
        />
      )}

      {/* Fallback img tag — uses AVIF base as src */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : priority ? 'eager' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={draggable}
        className={`
          ${className}
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          objectFit,
          aspectRatio: `${width} / ${height}`,
        }}
        onLoad={handleLoad}
        onError={handleError}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={(e) => {
          if (e.button === 1) e.preventDefault(); // Middle click
        }}
        {...props}
      />

      {/* Loading placeholder with blur effect */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </picture>
  );
};

// Higher-order component for image galleries
export const ImageGallery = ({ images, itemClassName = '', ...props }) => {
  const [loadedCount, setLoadedCount] = useState(0);
  
  const handleImageLoad = () => {
    setLoadedCount(prev => prev + 1);
  };

  return (
    <div className="image-gallery" {...props}>
      {images.map((image, index) => (
        <OptimizedImage
          key={image.id || index}
          src={image.src}
          alt={image.alt}
          className={itemClassName}
          onLoad={handleImageLoad}
          lazy={index > 2} // Only lazy load images after the first 3
          preload={index < 3} // Preload first 3 images
        />
      ))}
      
      {loadedCount < images.length && (
        <div className="loading-indicator">
          Loading images... ({loadedCount}/{images.length})
        </div>
      )}
    </div>
  );
};

// Product image component with multiple variants
export const ProductImage = ({ 
  product, 
  variant = 'main',
  width = 1200,
  height = 1200,
  priority = false,
  ...props 
}) => {
  const getImageSrc = () => {
    if (!product?.images?.length) {
      // Fallback to single image field
      return product?.image || null;
    }
    
    // Get specific variant or fallback to first image
    const image = variant === 'main' 
      ? product.images[0]
      : product.images.find(img => img.variant === variant) || product.images[0];
    
    return image?.url || image;
  };

  return (
    <OptimizedImage
      src={getImageSrc()}
      alt={product?.name || product?.title || 'Product image'}
      width={width}
      height={height}
      priority={priority}
      {...props}
    />
  );
};

// CSS styles (inject these into your global styles)
export const optimizedImageStyles = `
  .optimized-image {
    transition: all 0.3s ease;
    display: block;
    width: 100%;
    height: auto;
  }

  .optimized-image.loading {
    filter: blur(2px);
    opacity: 0.8;
  }

  .optimized-image.loaded {
    filter: none;
    opacity: 1;
  }

  .optimized-image.error {
    opacity: 0.5;
    background: #f0f0f0;
  }

  .image-placeholder {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #999;
  }

  .placeholder-content {
    text-align: center;
    font-size: 14px;
  }

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .image-gallery {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .loading-indicator {
    grid-column: 1 / -1;
    text-align: center;
    padding: 1rem;
    color: #666;
    font-size: 14px;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .image-gallery {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.5rem;
    }
  }
`;

export default OptimizedImage;
