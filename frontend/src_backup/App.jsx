import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About"; // ✅ Added About import
import AdminPage from "./pages/AdminPage";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import TaxilaToursShowcase from "./components/TaxilaToursShowcase"; 
import ProductPage from "./pages/ProductPage";
import AllProductsPage from "./pages/AllProductsPage";
import VisitTaxilaPage from "./pages/VisitTaxilaPage";
import Contact from './pages/Contact';
import OurMasters from './pages/OurMasters';
import SiteDetailPage from './pages/SiteDetailPage';
import FAQsPage from './pages/FAQsPage';
import ShippingReturnsPage from './pages/ShippingReturnsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ProductDetail from './components/ProductDetail';

const App = () => {
  const [showPopup, setShowPopup] = useState(true); // Always show on load

  // Auto-hide popup after 4 seconds with cleanup
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 4000);
    
    // Cleanup function to clear timer if component unmounts or popup is manually closed
    return () => clearTimeout(timer);
  }, [showPopup]); // Added showPopup as dependency

  // Function to close popup immediately
  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
         <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} /> {/* ✅ Added About route */}
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/products" element={<AllProductsPage />} />
            <Route path="/category/:categoryName" element={<ProductPage />} />
            <Route path="/visit-taxila" element={< TaxilaToursShowcase/>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/our-masters" element={<OurMasters />} />
            <Route path="/site-detail/:id" element={<SiteDetailPage />} />
            <Route path="/FAQsPage" element={<FAQsPage />} />
            <Route path="/PrivacyPolicyPage" element={<PrivacyPolicyPage />} />

            {/* Admin Authentication Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
        
        {/* Welcome Popup - Every Visit */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={closePopup}>
            <div className="relative max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
              <img src="/GandharaImages/Pop up.png" alt="Welcome to Gandhara Arts" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
              
              {/* Close Button */}
              <button onClick={closePopup} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold">×</button>
              
              {/* Tours Button - Matching Blue Color */}
              <button 
                onClick={() => {
                  closePopup(); // Use the closePopup function
                  window.location.href = '/visit-taxila';
                }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#1E90FF] to-[#4169E1] hover:from-[#4169E1] hover:to-[#1E90FF] text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                BOOK NOW
              </button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;