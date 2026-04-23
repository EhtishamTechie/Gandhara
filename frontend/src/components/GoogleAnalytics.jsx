import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import logger from '../utils/logger';

const GoogleAnalytics = () => {
  const GA_MEASUREMENT_ID = 'G-RL5LEWV0H7';
  const location = useLocation();

  // Load GA4 script once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.gtag) {
      try {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        script.onload = () => {
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            window.dataLayer.push(arguments);
          }
          window.gtag = gtag;

          gtag('js', new Date());
          gtag('config', GA_MEASUREMENT_ID, {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            send_page_view: false // We send page views manually on route change
          });

          logger.log('Google Analytics loaded successfully');
        };

        script.onerror = () => {
          logger.log('Google Analytics blocked by ad blocker or privacy settings');
        };

        document.head.appendChild(script);
      } catch (error) {
        logger.error('Google Analytics initialization failed:', error);
      }
    }
  }, []);

  // Track page views on route changes using React Router's location (no history monkey-patching)
  useEffect(() => {
    if (window.gtag) {
      try {
        window.gtag('event', 'page_view', {
          page_path: location.pathname,
          page_title: document.title,
          page_location: window.location.href
        });
      } catch (error) {
        // Silent fail — likely blocked by ad blocker
      }
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;
