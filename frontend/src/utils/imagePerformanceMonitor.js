// Performance monitoring and reporting for image optimization

class ImagePerformanceMonitor {
  constructor() {
    this.metrics = {
      totalImages: 0,
      optimizedImages: 0,
      totalLoadTime: 0,
      averageLoadTime: 0,
      webpSupported: false,
      bandwidthSaved: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.loadTimes = [];
    this.startTime = Date.now();
    
    this.init();
  }

  init() {
    // Check WebP support
    this.checkWebPSupport();
    
    // Monitor network requests
    this.monitorNetworkRequests();
    
    // Monitor image loading
    this.monitorImageLoading();
    
    // Only auto-report in development (avoid production overhead)
    if (import.meta.env?.DEV) {
      setInterval(() => this.generateReport(), 30000);
    }
  }

  checkWebPSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    this.metrics.webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  monitorNetworkRequests() {
    // Use PerformanceObserver for resource timing (non-invasive, no fetch monkey-patching)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (this.isImageRequest(entry.name)) {
              this.recordImageRequest(entry.name, entry.duration, null);
            }
          }
        });
        observer.observe({ type: 'resource', buffered: true });
      } catch (e) {
        // Resource timing not supported
      }
    }
  }

  monitorImageLoading() {
    // Use MutationObserver to track dynamically added images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const images = node.tagName === 'IMG' 
              ? [node] 
              : node.querySelectorAll?.('img') || [];
            
            images.forEach(img => this.trackImage(img));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Track existing images
    document.querySelectorAll('img').forEach(img => this.trackImage(img));
  }

  isImageRequest(url) {
    if (typeof url !== 'string') return false;
    return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url) || 
           url.includes('/uploads/') ||
           url.includes('size=');
  }

  recordImageRequest(url, loadTime, response, error) {
    this.metrics.totalImages++;
    this.loadTimes.push(loadTime);
    this.metrics.totalLoadTime += loadTime;
    this.metrics.averageLoadTime = this.metrics.totalLoadTime / this.metrics.totalImages;

    if (url.includes('size=') || url.includes('optimized')) {
      this.metrics.optimizedImages++;
    }

    // Check cache status
    if (response) {
      const cacheHeader = response.headers.get('cache-control') || '';
      if (cacheHeader.includes('max-age')) {
        this.metrics.cacheHits++;
      } else {
        this.metrics.cacheMisses++;
      }

      // Estimate bandwidth saved
      const contentLength = parseInt(response.headers.get('content-length') || '0');
      if (url.includes('webp') || url.includes('optimized')) {
        // Estimate 30% savings on average
        this.metrics.bandwidthSaved += contentLength * 0.3;
      }
    }
  }

  trackImage(img) {
    if (img.dataset.tracked) return; // Already tracking
    
    img.dataset.tracked = 'true';
    const startTime = performance.now();

    const onLoad = () => {
      const loadTime = performance.now() - startTime;
      this.recordImageRequest(img.src, loadTime, { headers: new Map() });
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    const onError = () => {
      const loadTime = performance.now() - startTime;
      this.recordImageRequest(img.src, loadTime, null, new Error('Image failed to load'));
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    if (img.complete) {
      onLoad(); // Already loaded
    } else {
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    }
  }

  generateReport() {
    const report = {
      ...this.metrics,
      sessionDuration: Math.round((Date.now() - this.startTime) / 1000),
      optimizationRate: this.metrics.totalImages ? 
        Math.round((this.metrics.optimizedImages / this.metrics.totalImages) * 100) : 0,
      medianLoadTime: this.calculateMedian(this.loadTimes),
      p95LoadTime: this.calculatePercentile(this.loadTimes, 95),
      bandwidthSavedMB: Math.round(this.metrics.bandwidthSaved / 1024 / 1024 * 100) / 100
    };

    console.group('🚀 Image Performance Report');
    console.log('📊 Basic Metrics:', {
      'Total Images': report.totalImages,
      'Optimized Images': report.optimizedImages,
      'Optimization Rate': `${report.optimizationRate}%`,
      'WebP Supported': report.webpSupported ? '✅' : '❌'
    });
    
    console.log('⚡ Performance:', {
      'Average Load Time': `${Math.round(report.averageLoadTime)}ms`,
      'Median Load Time': `${Math.round(report.medianLoadTime)}ms`,
      'P95 Load Time': `${Math.round(report.p95LoadTime)}ms`
    });
    
    console.log('💾 Bandwidth:', {
      'Estimated Savings': `${report.bandwidthSavedMB} MB`,
      'Cache Hits': report.cacheHits,
      'Cache Misses': report.cacheMisses,
      'Cache Hit Rate': report.cacheHits + report.cacheMisses > 0 ? 
        `${Math.round((report.cacheHits / (report.cacheHits + report.cacheMisses)) * 100)}%` : 'N/A'
    });
    
    console.log('🕒 Session:', {
      'Duration': `${Math.floor(report.sessionDuration / 60)}:${String(report.sessionDuration % 60).padStart(2, '0')}`,
      'Images/Min': report.sessionDuration ? Math.round((report.totalImages / report.sessionDuration) * 60) : 0
    });
    console.groupEnd();

    // Send to analytics (if implemented)
    this.sendToAnalytics(report);

    return report;
  }

  calculateMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculatePercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.min(index, sorted.length - 1)];
  }

  sendToAnalytics(report) {
    // Send performance data to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'image_performance', {
        'custom_parameter_1': report.averageLoadTime,
        'custom_parameter_2': report.optimizationRate,
        'custom_parameter_3': report.bandwidthSavedMB
      });
    }
  }

  // Public method to get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Method to reset metrics
  reset() {
    this.metrics = {
      totalImages: 0,
      optimizedImages: 0,
      totalLoadTime: 0,
      averageLoadTime: 0,
      webpSupported: this.metrics.webpSupported,
      bandwidthSaved: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.loadTimes = [];
    this.startTime = Date.now();
  }
}

// Initialize monitoring (call this in your main app)
let performanceMonitor;

export function initImagePerformanceMonitoring() {
  if (typeof window !== 'undefined' && !performanceMonitor) {
    performanceMonitor = new ImagePerformanceMonitor();
    
    // Make it available globally for debugging
    window.imagePerformanceMonitor = performanceMonitor;
    
    console.log('🚀 Image performance monitoring initialized');
    console.log('💡 Access metrics anytime with: window.imagePerformanceMonitor.generateReport()');
  }
  
  return performanceMonitor;
}

export { ImagePerformanceMonitor };
export default initImagePerformanceMonitoring;
