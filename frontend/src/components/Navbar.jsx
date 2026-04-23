import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { MessageCircle, MapPin, Menu, X, Search } from "lucide-react";

/**
 * Navbar (Redesign v2 — 2026-04)
 *
 * Per the Gandhara Arts redesign spec:
 *  - Removed the entire category strip (now lives in the right-side CategorySidebar)
 *  - Deduplicated "All Products" (previously rendered twice on desktop via slice(0,2) + slice(-3))
 *  - Final links: Logo | Home | All Products | About | Contact | [Search] | [Wholesale] | [Visit Taxila]
 *  - Sticky on scroll, box-shadow appears only after scrolling
 *  - Background: #1C1C2E (deep navy)
 *  - Hamburger icon: #C9A84C (gold)
 *  - Mobile: smooth slide-down drawer
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Show a subtle box-shadow only after the user starts scrolling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Final nav links (deduped). The category list has been moved to the right-side sidebar.
  const coreMenuItems = [
    { name: "Home", path: "/" },
    { name: "All Products", path: "/products" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const openWhatsApp = () => {
    const phoneNumber = "923005567507";
    const message = "Hello! I'm interested in wholesale dealership opportunities with Gandhara Arts and Taxila Stone Crafts.";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery("");
  };

  // Shared NavLink class — active = gold, hover = subtle gold tint
  const navLinkClass = ({ isActive }) => `
    relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
    ${isActive
      ? 'text-[#C9A84C] bg-white/5'
      : 'text-[#F5F0E8] hover:text-[#C9A84C] hover:bg-white/5'}
  `;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-shadow duration-300 bg-[#1C1C2E] ${
          isScrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.45)]' : 'shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center transition-transform duration-300 hover:scale-105">
                <img
                  className="h-14 w-14 object-contain"
                  src="/GandharaImages/Gandharalogo.webp"
                  alt="Gandhara Arts Logo"
                  width={56}
                  height={56}
                />
                <div className="ml-3 hidden sm:block">
                  <h1 className="text-lg font-bold text-[#F5F0E8] leading-tight">Gandhara Arts</h1>
                  <p className="text-xs text-[#C9A84C] tracking-wide">Taxila Stone Crafts</p>
                </div>
              </Link>
            </div>

            {/* Desktop Nav (deduped) */}
            <nav className="hidden lg:flex items-center space-x-1">
              {coreMenuItems.map((item) => (
                <NavLink key={item.name} to={item.path} className={navLinkClass} end={item.path === '/'}>
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Right-side actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">

              {/* Search */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open search"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-[#F5F0E8] hover:text-[#C9A84C] hover:bg-white/10 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wholesale CTA (desktop) */}
              <button
                type="button"
                onClick={openWhatsApp}
                className="hidden lg:inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C2E] focus-visible:ring-[#25D366]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Wholesale</span>
              </button>

              {/* Visit Taxila CTA (desktop) */}
              <Link
                to="/visit-taxila"
                className="hidden lg:inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B96A] text-[#1C1C2E] px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C2E] focus-visible:ring-[#C9A84C]"
              >
                <MapPin className="w-4 h-4" />
                <span>Visit Taxila</span>
              </Link>

              {/* Mobile hamburger — gold icon per spec */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((o) => !o)}
                className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen
                  ? <X className="w-7 h-7 text-[#C9A84C]" />
                  : <Menu className="w-7 h-7 text-[#C9A84C]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile slide-down drawer */}
        <div
          id="mobile-drawer"
          className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out bg-[#1C1C2E] border-t border-white/10 ${
            isMobileMenuOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto">

            {/* Mobile search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 text-[#F5F0E8] placeholder-[#6B6B80] border border-white/10 focus:border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A84C] hover:text-[#D4B96A] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* Core links */}
            <div className="space-y-1">
              {coreMenuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `
                    block px-4 py-3 rounded-xl text-base font-medium transition-colors
                    ${isActive
                      ? 'text-[#C9A84C] bg-white/5'
                      : 'text-[#F5F0E8] hover:text-[#C9A84C] hover:bg-white/5'}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Mobile CTAs */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={() => { openWhatsApp(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white px-4 py-3 rounded-xl text-base font-semibold shadow-md transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Wholesale Inquiry</span>
              </button>

              <Link
                to="/visit-taxila"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#D4B96A] text-[#1C1C2E] px-4 py-3 rounded-xl text-base font-semibold shadow-md transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span>Visit Taxila Tours</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start justify-center pt-20 px-4"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-[#1E1E30] border border-[#2E2E45] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#F5F0E8]">Search Products</h3>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Close search"
                  className="text-[#A89880] hover:text-[#C9A84C] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for stone crafts, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full px-5 py-4 rounded-xl bg-[#0F0F1A] text-[#F5F0E8] placeholder-[#6B6B80] border border-[#2E2E45] focus:border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                  />
                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#C9A84C] hover:bg-[#D4B96A] text-[#1C1C2E] p-2 rounded-lg transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
