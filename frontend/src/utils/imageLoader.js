// Enhanced image loading utilities
export class ImageLoader {
  static sizes = {
    thumbnail: 150,
    small: 400,
    medium: 800,
    large: 1200,
    xlarge: 1600
  };

  // Check AVIF support
  static supportsAVIF() {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  // Check WebP support
  static supportsWebP() {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Determine best format support
  static getBestFormat() {
    if (this.supportsAVIF()) return 'avif';
    if (this.supportsWebP()) return 'webp';
    return 'jpg';
  }

  // Convert image URL to optimized format
  static getOptimizedUrl(originalUrl, size = 'medium', format = null) {
    if (!originalUrl) return null;
    
    // Remove extension and get base path
    let basePath = originalUrl.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    
    // CRITICAL FIX: ALL AVIF files are in /uploads/ root directory
    // Remove /products/ prefix if present to normalize to root uploads/
    basePath = basePath.replace('/uploads/products/', '/uploads/');
    
    // Remove subdirectories (original/, compressed/, thumbnails/)
    basePath = basePath.replace(/\/(original|compressed|thumbnails)\//g, '/');
    
    const sizeWidth = this.sizes[size] || this.sizes.medium;
    const targetFormat = format || this.getBestFormat();
    
    // If original is already optimized format, return as-is
    if (originalUrl.endsWith(`.${targetFormat}`)) {
      return originalUrl;
    }
    
    // For thumbnail, just use format without size suffix
    if (size === 'thumbnail' || sizeWidth === this.sizes.thumbnail) {
      return `${basePath}.${targetFormat}`;
    }
    
    // Return optimized path with size and format
    return `${basePath}-${sizeWidth}w.${targetFormat}`;
  }

  // Generate srcset for responsive images (AVIF)
  static generateAVIFSrcSet(baseUrl, maxWidth = 1600) {
    if (!baseUrl) return '';
    
    let basePath = baseUrl.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    
    // Normalize to /uploads/ root (remove /products/ if present)
    basePath = basePath.replace('/uploads/products/', '/uploads/');
    
    // Remove subdirectories - optimized files are in root uploads
    basePath = basePath.replace(/\/(original|compressed|thumbnails)\//g, '/');
    
    // Defensive srcset: always include 400w (guaranteed), add 800w for larger screens
    // Skip 1200w — base AVIF already covers full size and 1200w variants are often identical
    const srcParts = [`${basePath}-400w.avif 400w`];
    if (maxWidth >= 800) srcParts.push(`${basePath}-800w.avif 800w`);
    return srcParts.join(', ');
  }

  // Generate srcset for responsive images (WebP fallback)
  static generateWebPSrcSet(baseUrl, maxWidth = 1600) {
    if (!baseUrl) return '';
    
    let basePath = baseUrl.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    
    // Normalize to /uploads/ root (remove /products/ if present)
    basePath = basePath.replace('/uploads/products/', '/uploads/');
    
    // Remove subdirectories - optimized files are in root uploads
    basePath = basePath.replace(/\/(original|compressed|thumbnails)\//g, '/');
    
    // Defensive srcset: 400w baseline + 800w for larger screens
    const srcParts = [`${basePath}-400w.webp 400w`];
    if (maxWidth >= 800) srcParts.push(`${basePath}-800w.webp 800w`);
    return srcParts.join(', ');
  }

  // Generate srcset for legacy browsers
  static generateSrcSet(baseUrl) {
    if (!baseUrl) return '';
    
    let basePath = baseUrl.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
    
    // Normalize to /uploads/ root (remove /products/ if present)
    basePath = basePath.replace('/uploads/products/', '/uploads/');
    
    // Remove subdirectories - optimized files are in root uploads
    basePath = basePath.replace(/\/(original|compressed|thumbnails)\//g, '/');
    
    const ext = baseUrl.match(/\.(jpg|jpeg|png|webp|avif)$/i)?.[1] || 'jpg';
    
    return Object.entries(this.sizes)
      .filter(([key]) => key !== 'thumbnail')
      .map(([_, width]) => `${basePath}-${width}w.${ext} ${width}w`)
      .join(', ');
  }

  // Generate sizes attribute based on breakpoints
  static generateSizes(customSizes = null, maxWidth = 1600) {
    if (customSizes) return customSizes;
    
    // Responsive sizes based on available breakpoints
    if (maxWidth <= 400) return '400px';
    return '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px';
  }

  // Lazy loading observer
  static createLazyLoader() {
    if (typeof window === 'undefined') return null;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }

          // Add loaded class for animations
          img.classList.add('loaded');
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.1
    });

    return observer;
  }

  // Preload critical images
  static preloadImage(url, size = 'medium') {
    if (typeof window === 'undefined') return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = this.getOptimizedUrl(url, size);
    });
  }

  // Preload multiple images
  static async preloadImages(urls, size = 'medium') {
    if (!Array.isArray(urls)) return [];
    
    const promises = urls.map(url => 
      this.preloadImage(url, size).catch(err => {
        console.warn(`Failed to preload image: ${url}`, err);
        return null;
      })
    );
    
    return Promise.all(promises);
  }

  // Create a progressive image element
  static createProgressiveImage(src, alt = '', className = '') {
    const img = document.createElement('img');
    
    img.className = `progressive-image ${className}`;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    
    // Set up responsive attributes
    img.setAttribute('data-src', this.getOptimizedUrl(src, 'medium'));
    img.setAttribute('data-srcset', this.generateSrcSet(src));
    img.sizes = this.generateSizes();
    
    // Placeholder (tiny thumbnail)
    img.src = this.getOptimizedUrl(src, 'thumbnail');
    
    return img;
  }
}

// React Hook for optimized images
export function useOptimizedImage(src, options = {}) {
  const {
    size = 'medium',
    preload = false,
    lazy = true
  } = options;

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(null);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    if (!src) return;

    if (preload) {
      ImageLoader.preloadImage(src, size)
        .then(() => setIsLoaded(true))
        .catch(setError);
    }

    if (lazy && imgRef.current) {
      const observer = ImageLoader.createLazyLoader();
      if (observer) {
        observer.observe(imgRef.current);
        return () => observer.disconnect();
      }
    }
  }, [src, size, preload, lazy]);

  return {
    src: ImageLoader.getOptimizedUrl(src, size),
    srcSet: ImageLoader.generateSrcSet(src),
    sizes: ImageLoader.generateSizes(),
    isLoaded,
    error,
    ref: imgRef
  };
}

// CSS for progressive loading animations
export const progressiveImageCSS = `
  .progressive-image {
    transition: filter 0.3s ease, opacity 0.3s ease;
    filter: blur(5px);
    opacity: 0.8;
  }
  
  .progressive-image.loaded {
    filter: blur(0);
    opacity: 1;
  }
  
  .progressive-image.error {
    opacity: 0.5;
    filter: grayscale(1);
  }
`;

export default ImageLoader;
