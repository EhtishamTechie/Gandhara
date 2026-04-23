// Core Web Vitals Performance Monitoring
// Tracks LCP, INP, CLS, FCP, TTFB and sends to analytics

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

const sendToAnalytics = ({ name, delta, id, value }) => {
  // Send to Google Analytics if available
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true,
    });
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`📊 ${name}:`, {
      value: Math.round(value),
      rating: getRating(name, value),
      id
    });
  }

  // Send to backend analytics endpoint (disabled — endpoint doesn't exist)
  // To re-enable, create a POST /api/analytics/vitals endpoint on the backend
  // if (import.meta.env.PROD) {
  //   fetch('/api/analytics/vitals', { ... }).catch(() => {});
  // }
};

// Rating thresholds (good/needs-improvement/poor)
const getRating = (metric, value) => {
  const thresholds = {
    LCP: [2500, 4000], // Largest Contentful Paint
    FID: [100, 300],   // First Input Delay
    CLS: [0.1, 0.25],  // Cumulative Layout Shift
    FCP: [1800, 3000], // First Contentful Paint
    TTFB: [800, 1800], // Time to First Byte
  };

  const [good, poor] = thresholds[metric] || [0, 0];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  // Core Web Vitals
  onLCP(sendToAnalytics);  // Largest Contentful Paint (loading)
  onINP(sendToAnalytics);  // Interaction to Next Paint (interactivity) - replaces FID
  onCLS(sendToAnalytics);  // Cumulative Layout Shift (visual stability)
  onFCP(sendToAnalytics);  // First Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte

  // Additional performance marks
  if ('performance' in window) {
    // Log navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          const metrics = {
            'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
            'TCP Connection': perfData.connectEnd - perfData.connectStart,
            'Request Time': perfData.responseStart - perfData.requestStart,
            'Response Time': perfData.responseEnd - perfData.responseStart,
            'DOM Processing': perfData.domContentLoadedEventEnd - perfData.responseEnd,
            'Load Complete': perfData.loadEventEnd - perfData.loadEventStart,
            'Total Load Time': perfData.loadEventEnd - perfData.fetchStart,
          };

          if (import.meta.env.DEV) {
            console.table(metrics);
          }
        }
      }, 0);
    });
  }
};

// Report any long tasks (>50ms)
export const observeLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration}ms`, entry);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long tasks not supported in some browsers
    }
  }
};
