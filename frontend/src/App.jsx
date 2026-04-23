import GoogleAnalytics from "./components/GoogleAnalytics";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CategorySidebar from "./components/CategorySidebar";
import ThemeApplier from "./components/ThemeApplier";
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import PageTransition from './components/PageTransition';
import { GlobalMediaProtection } from './components/ProtectedMedia';
import { usePrefetch } from './hooks/usePrefetch';
import { initImageProtection, disableBrowserImageFeatures } from './utils/imageProtection';

// Eager load critical components (above the fold)
import Home from "./pages/Home";

// Lazy load non-critical pages for better performance
const About = lazy(() => import("./pages/About"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const TaxilaToursShowcase = lazy(() => import("./components/TaxilaToursShowcase"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const AllProductsPage = lazy(() => import("./pages/AllProductsPage"));
const VisitTaxilaPage = lazy(() => import("./pages/VisitTaxilaPage"));
const Contact = lazy(() => import('./pages/Contact'));
const OurMasters = lazy(() => import('./pages/OurMasters'));
const SiteDetailPage = lazy(() => import('./pages/SiteDetailPage'));
const FAQsPage = lazy(() => import('./pages/FAQsPage'));
const ShippingReturnsPage = lazy(() => import('./pages/ShippingReturnsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const TourDetail = lazy(() => import('./components/TourDetail'));
const WordPressRedirects = lazy(() => import('./components/WordPressRedirects'));
const BulkUpload = lazy(() => import('./pages/BulkUpload'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const PrivateTourBooking = lazy(() => import('./pages/PrivateTourBooking'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#F1C27D]"></div>
  </div>
);

// Wrapper component for prefetching - must be inside Router
const AppContent = () => {
  // Enable route prefetching for faster navigation
  usePrefetch();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  /** Private booking page — no category sidebar for a cleaner form */
  const isPrivateBookTour = location.pathname.startsWith('/book-tour');

  return (
    <>
      {/* Runtime theme overrides from the admin (Section 7). Renders
          nothing; mutates CSS custom properties on <html>. */}
      <ThemeApplier />
      <GlobalMediaProtection />
      <GoogleAnalytics />
      <ScrollToTop />
      {/*
        `has-right-sidebar` enables the desktop layout push (see
        CategorySidebar.css) so <main> and <Footer> don't get hidden
        behind the docked sidebar. Applied on every non-admin route
        because that's where <CategorySidebar /> renders.
      */}
      <div className={`flex flex-col min-h-screen ${!isAdminRoute && !isPrivateBookTour ? 'has-right-sidebar' : ''}`}>
        {!isAdminRoute && <Navbar />}
        <main className="flex-grow">
          <Suspense fallback={<LoadingFallback />}>
            <PageTransition>
            <Routes>
              {/* Regular routes - Specific routes MUST come before wildcards */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<AllProductsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/book-tour/:token" element={<PrivateTourBooking />} />
              <Route path="/category/:categoryName" element={<ProductPage />} />
              <Route path="/visit-taxila" element={<TaxilaToursShowcase/>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/our-masters" element={<OurMasters />} />
              <Route path="/site-detail/:id" element={<SiteDetailPage />} />
              <Route path="/FAQsPage" element={<FAQsPage />} />
              <Route path="/PrivacyPolicyPage" element={<PrivacyPolicyPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Product Detail Route */}
              <Route path="/product/:productId" element={<ProductDetail />} />

              {/* Tour / visit-place detail (same pattern as product detail) */}
              <Route path="/tour/:tourId" element={<TourDetail />} />

              {/* WordPress redirect routes - Only for old WordPress URLs */}
              <Route path="/product-category/*" element={<WordPressRedirects />} />
              <Route path="/product-tag/*" element={<WordPressRedirects />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bulk-upload"
                element={
                  <ProtectedRoute>
                    <BulkUpload />
                  </ProtectedRoute>
                }
              />
            </Routes>
            </PageTransition>
          </Suspense>
        </main>
        {!isAdminRoute && <Footer />}

        {/* Section 3: right-side category + subcategory sidebar.
            Rendered on every non-admin page. Handles its own
            open/closed state + responsive behaviour internally. */}
        {!isAdminRoute && !isPrivateBookTour && <CategorySidebar />}

        {/* Section 8: floating scroll-to-top button. Hidden on /admin
            routes to keep the dashboard clean. */}
        {!isAdminRoute && !isPrivateBookTour && <ScrollToTopButton />}
      </div>
    </>
  );
};

const App = () => {
  useEffect(() => {
    // Initialize image protection on mount
    initImageProtection();
    disableBrowserImageFeatures();
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
