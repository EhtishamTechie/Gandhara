import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { MessageCircle } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define menu structure - UPDATED: Added "About" to the menu
  const coreMenuItems = ["Home","All Products","Our Masters", "Contact","About"];
  const shopCategoryItems = [
    "Gandhara Art", "Antique Products", "Calligraphy", "Crockery", "Home Decor",
    "Garden Decor", "Fireplaces", "Building Embellishing", "Fountains", "Mortar and Pestle", "Grinding Mills",
    "Ashtray","Coin" , "Decorative Motive", "Stone Sanitary", "Moulded Art",
    "Jewellery", "Carved Stone", "Precious Stone", "Salt", "Featured Products", "Luxary Collection", "Raw Stone",
    "Grave Designs" // ✅ Added Grave Designs category
  ];

  // WhatsApp function for wholesale dealership
  const openWhatsApp = () => {
    const phoneNumber = "923005567507";
    const message = "Hello! I'm interested in wholesale dealership opportunities with Gandhara Arts and Taxila Stone Crafts.";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  // Function to generate paths - UPDATED: Added About path
  const getPath = (item) => {
    switch (item) {
      case "Admin": return "/admin";
      case "About": return "/about"; // ✅ Added About path
      case "Contact": return "/Contact";
      case "Home": return "/";
      case "All Products": return "/products";
      case "Our Masters": return "/our-masters"; // ✅ Added Our Masters path
      default: return `/category/${item.replace(/\s+/g, "-").toLowerCase()}`;
    }
  };

  // Reusable NavLink classes - UPDATED: increased text size, padding
  const navLinkClasses = "text-base font-medium text-[#E2E8F0] hover:text-[#F1C27D] transition-colors duration-300 ease-in-out px-4 py-3 rounded-md whitespace-nowrap";
  const activeNavLinkClasses = "text-[#E6A44E] font-semibold";

  // Category link classes - UPDATED: increased text size, padding
  const categoryLinkClasses = "text-sm font-medium text-[#E2E8F0] hover:text-[#F1C27D] transition-colors duration-300 ease-in-out px-3 py-2 rounded-md whitespace-nowrap";
  const activeCategoryLinkClasses = "text-[#E6A44E] font-semibold";

  return (
    <header className="bg-[#0F172A]/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-[#334155]" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Navigation Row - UPDATED: increased height */}
        <div className="flex justify-between items-center h-20 m-5">
          {/* Logo - UPDATED: increased logo size */}
          <div className="flex-shrink-0">
            <Link to="/" title="Gandhara Home Page" className="flex items-center">
              <img className="h-36 w-36" src="GandharaImages/Gandharalogo.png" alt="Gandhara Company Logo" />
            </Link>
          </div>

          {/* Desktop Main Menu */}
          <div className="hidden md:flex md:items-center md:justify-center flex-grow">
            <nav className="flex items-center space-x-2 lg:space-x-3" aria-label="Primary Navigation">
              {coreMenuItems.map((item) => (
                <NavLink
                  key={item}
                  to={getPath(item)}
                  title={`Explore ${item}`}
                  className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                >
                  {item}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Action Buttons Container */}
          <div className="hidden md:flex items-center flex-shrink-0 ml-4 space-x-3">
            {/* Wholesale Dealership Button - NEW: Prominent WhatsApp button */}
            <button
              onClick={openWhatsApp}
              className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white px-6 py-3 rounded-full text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out whitespace-nowrap flex items-center space-x-2 border-2 border-transparent hover:border-[#25D366] transform hover:scale-105"
              title="Contact us for Wholesale Dealership via WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Wholesale Dealership</span>
            </button>

            {/* Visit Taxila Button */}
            <Link
              to="/visit-taxila"
              aria-label="Book a Visit to Taxila"
              className="bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] px-6 py-3 rounded-full text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 ease-in-out whitespace-nowrap"
            >
              Visit Taxila With Us
            </Link>
          </div>

          {/* Mobile menu button - UPDATED: increased size */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-md text-[#E2E8F0] hover:text-[#F1C27D] hover:bg-[#334155] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E6A44E] transition duration-150 ease-in-out"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              <span className="sr-only">{isMobileMenuOpen ? "Close main menu" : "Open main menu"}</span>
              <svg className="h-8 w-8" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                 {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Categories Row - Desktop Only - UPDATED: increased padding */}
        <div className="hidden md:block border-t border-[#334155]/50">
          <div className="py-3">
            <div className="flex items-center justify-center">
              <span className="text-sm font-medium text-[#F1C27D] mr-4">Stone Shop Categories:</span>
            </div>
            {/* Categories in multiple rows using flexbox wrap - UPDATED: increased gap */}
            <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 mt-2" aria-label="Shop Categories">
              {shopCategoryItems.map((item) => (
                <NavLink
                  key={item}
                  to={getPath(item)}
                  title={`Explore ${item}`}
                  className={({ isActive }) => `${categoryLinkClasses} ${isActive ? activeCategoryLinkClasses : ''} `}
                >
                  {item}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden ${isMobileMenuOpen ? 'max-h-[70vh] pb-4' : 'max-h-0'} overflow-y-auto transition-max-height duration-500 ease-in-out border-t border-[#334155]`}
        id="mobile-menu"
      >
        <nav className="px-3 pt-3 pb-4 space-y-2 sm:px-4 bg-[#0F172A]" aria-label="Mobile Navigation">
          {/* Core Mobile Links - UPDATED: increased text and padding */}
          {coreMenuItems.map((item) => (
            <NavLink
              key={`mobile-${item}`}
              to={getPath(item)}
              title={`Explore ${item}`}
              className={({ isActive }) => `block px-4 py-3 rounded-md text-lg font-medium text-[#E2E8F0] hover:text-[#F1C27D] hover:bg-[#334155] transition-colors duration-200 ease-in-out ${isActive ? 'bg-[#334155] text-[#E6A44E]' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </NavLink>
          ))}

          {/* Mobile Wholesale Dealership Button - NEW */}
          <button
            onClick={() => {
              openWhatsApp();
              setIsMobileMenuOpen(false);
            }}
            className="w-full mt-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white px-4 py-3 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Wholesale Dealership</span>
          </button>

          {/* Shop Categories Section Header - UPDATED: increased text size and padding */}
          <div className="px-4 py-3 text-lg font-medium text-[#F1C27D] border-t border-[#334155] mt-5 pt-5">
            Shop Categories (Stone)
          </div>

          {/* Mobile Shop Categories Grid - UPDATED: increased text size */}
          <div className="px-3 py-3">
            <div className="grid grid-cols-2 gap-2">
              {shopCategoryItems.map((item) => (
                <NavLink
                  key={`mobile-shop-${item}`}
                  to={getPath(item)}
                  title={`Explore ${item}`}
                  className={({ isActive }) => `block px-3 py-3 rounded-md text-base font-medium text-[#E2E8F0] hover:text-[#F1C27D] hover:bg-[#334155] transition-colors duration-200 ease-in-out text-center ${isActive ? 'bg-[#334155] text-[#E6A44E]' : ''} ${item === 'Grave Designs' ? 'bg-[#334155]/30 border border-[#64748B]' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Mobile CTA Button - UPDATED: increased text size and padding */}
          <Link
              to="/visit-taxila"
              aria-label="Book a Visit to Taxila"
              className="block w-full text-center mt-5 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] px-5 py-3.5 rounded-full text-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
               onClick={() => setIsMobileMenuOpen(false)}
            >
              Visit Taxila With Us
            </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;