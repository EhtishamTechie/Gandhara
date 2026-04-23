import { NavLink, Link } from "react-router-dom";
import { MessageCircle, Phone, Mail, MapPin, Menu, X, ChevronDown, Search, ShoppingBag, Star } from "lucide-react";
import { useNavbar, useNavigationItems } from "../hooks/useNavbar";

const ProfessionalNavbar = () => {
  const {
    isScrolled,
    isMobileMenuOpen,
    isShopDropdownOpen,
    searchQuery,
    isSearchOpen,
    toggleMobileMenu,
    toggleShopDropdown,
    toggleSearch,
    closeMobileMenu,
    closeShopDropdown,
    closeSearch,
    handleSearch,
    openWhatsApp,
    setSearchQuery
  } = useNavbar();

  const { coreMenuItems, shopCategoryItems, featuredCategories, getCategoryPath } = useNavigationItems();

  return (
    <>
      {/* Top Bar - Contact Info */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-2 px-4 hidden lg:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 hover:text-amber-300 transition-colors cursor-pointer">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>+92 300 5567507</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-amber-300 transition-colors cursor-pointer">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>info@gandhara-arts.com</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-amber-300 transition-colors cursor-pointer">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Taxila, Pakistan</span>
            </div>
          </div>
          <div className="text-amber-400 font-medium flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Authentic Stone Crafts Since 1995</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-slate-900/95 backdrop-blur-md shadow-2xl border-b border-slate-700' 
            : 'bg-slate-900/90 backdrop-blur-sm shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Navigation Row */}
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0 group">
              <Link 
                to="/" 
                className="flex items-center transition-all duration-300 hover:scale-105"
                onClick={closeMobileMenu}
              >
                <img 
                  className="h-16 w-16 object-contain filter brightness-110 transition-all duration-300 group-hover:brightness-125" 
                  src="/GandharaImages/Gandharalogo.webp" 
                  alt="Gandhara Arts Logo"
                  width={64}
                  height={64}
                />
                <div className="ml-3 hidden sm:block">
                  <h1 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors duration-300">
                    Gandhara Arts
                  </h1>
                  <p className="text-xs text-amber-400 group-hover:text-amber-300 transition-colors duration-300">
                    Taxila Stone Crafts
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {coreMenuItems.slice(0, -2).map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => `
                    relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group
                    ${isActive 
                      ? 'text-amber-400 bg-slate-800/70 shadow-lg' 
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                  title={item.description}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-base group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </span>
                  {/* Animated underline */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 group-hover:w-full transition-all duration-300" />
                </NavLink>
              ))}

              {/* Shop Dropdown */}
              <div className="relative shop-dropdown">
                <button
                  onClick={toggleShopDropdown}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                    isShopDropdownOpen 
                      ? 'text-amber-400 bg-slate-800/70' 
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/50'
                  }`}
                  aria-expanded={isShopDropdownOpen}
                  aria-haspopup="true"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Shop</span>
                  <ChevronDown className={`w-4 h-4 transition-all duration-300 ${
                    isShopDropdownOpen ? 'rotate-180 text-amber-400' : 'group-hover:rotate-12'
                  }`} />
                </button>

                {/* Shop Dropdown Menu */}
                <div className={`absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 transition-all duration-300 ${
                  isShopDropdownOpen 
                    ? 'opacity-100 visible transform translate-y-0' 
                    : 'opacity-0 invisible transform -translate-y-4 pointer-events-none'
                }`}>
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
                      <ShoppingBag className="w-5 h-5 text-amber-600" />
                      <span>Stone Categories</span>
                    </h3>
                    <p className="text-sm text-slate-600">Discover our authentic handcrafted stone products</p>
                  </div>
                  
                  {/* Featured Categories */}
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>Featured</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {featuredCategories.slice(0, 6).map((item) => (
                          <NavLink
                            key={item}
                            to={getCategoryPath(item)}
                            className="px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-all duration-200 font-medium border hover:border-amber-200"
                            onClick={closeShopDropdown}
                          >
                            {item}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                    
                    {/* All Categories */}
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">All Categories</h4>
                      <div className="max-h-60 overflow-y-auto dropdown-scroll">
                        <div className="grid grid-cols-2 gap-1">
                          {shopCategoryItems.map((item) => (
                            <NavLink
                              key={item}
                              to={getCategoryPath(item)}
                              className="px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors duration-200"
                              onClick={closeShopDropdown}
                            >
                              {item}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remaining menu items */}
              {coreMenuItems.slice(-2).map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => `
                    relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group
                    ${isActive 
                      ? 'text-amber-400 bg-slate-800/70 shadow-lg' 
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                  title={item.description}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-base group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </span>
                  {/* Animated underline */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 group-hover:w-full transition-all duration-300" />
                </NavLink>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              
              {/* Search Button - Desktop */}
              <button
                onClick={toggleSearch}
                className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
                title="Search products (Ctrl+K)"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </button>

              {/* CTA Buttons - Desktop */}
              <div className="hidden lg:flex items-center space-x-3">
                <button
                  onClick={openWhatsApp}
                  className="group flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  title="Contact for wholesale opportunities"
                >
                  <MessageCircle className="w-4 h-4 group-hover:animate-bounce" />
                  <span>Wholesale</span>
                </button>

                <Link
                  to="/visit-taxila"
                  className="group flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  title="Book a guided tour to Taxila"
                >
                  <MapPin className="w-4 h-4 group-hover:animate-pulse" />
                  <span>Visit Taxila</span>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 hover:scale-105 transition-all duration-300 shadow-lg"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute inset-0 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100'
                  }`}>
                    <Menu className="w-6 h-6" />
                  </span>
                  <span className={`absolute inset-0 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-100' : 'opacity-0 -rotate-180'
                  }`}>
                    <X className="w-6 h-6" />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden bg-slate-900 border-t border-slate-700`}>
          <div className="p-6">
            
            {/* Mobile Search */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search stone crafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-800 text-white placeholder-slate-400 border border-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors duration-300 p-1 rounded-lg hover:bg-slate-700"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-4">
                Navigation
              </h3>
              {coreMenuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center space-x-4 px-5 py-4 rounded-2xl text-base font-medium transition-all duration-300
                    ${isActive 
                      ? 'text-amber-400 bg-slate-800/70 shadow-lg border border-slate-700' 
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-700'
                    }
                  `}
                  onClick={closeMobileMenu}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="flex-1">{item.name}</span>
                  {item.name === "Home" && (
                    <span className="text-xs text-amber-400 bg-amber-400/20 px-2 py-1 rounded-full">
                      Home
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Mobile Shop Categories */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-4 px-2">
                Shop Categories
              </h3>
              
              {/* Featured categories first */}
              <div className="mb-4">
                <h4 className="text-xs text-slate-400 mb-3 px-2 flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>FEATURED</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {featuredCategories.slice(0, 6).map((item) => (
                    <NavLink
                      key={item}
                      to={getCategoryPath(item)}
                      className="px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all duration-300 text-center border border-slate-700 hover:border-amber-500/50 hover:shadow-lg"
                      onClick={closeMobileMenu}
                    >
                      {item}
                    </NavLink>
                  ))}
                </div>
              </div>
              
              {/* All categories */}
              <div className="max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {shopCategoryItems.map((item) => (
                    <NavLink
                      key={item}
                      to={getCategoryPath(item)}
                      className="px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300 text-center border border-slate-800 hover:border-slate-600"
                      onClick={closeMobileMenu}
                    >
                      {item}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile CTA Buttons */}
            <div className="space-y-4 pt-6 border-t border-slate-700">
              <button
                onClick={() => {
                  openWhatsApp();
                  closeMobileMenu();
                }}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Wholesale Dealership</span>
              </button>

              <Link
                to="/visit-taxila"
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-4 rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                onClick={closeMobileMenu}
              >
                <MapPin className="w-5 h-5" />
                <span>Visit Taxila With Us</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm search-modal-backdrop"
          onClick={closeSearch}
        >
          <div 
            className="w-full max-w-2xl mt-20 mx-4 search-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center p-6">
                  <Search className="w-6 h-6 text-slate-400 mr-4" />
                  <input
                    type="text"
                    placeholder="Search for stone crafts, categories, products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-lg text-slate-900 placeholder-slate-500 border-0 focus:outline-none focus:ring-0 bg-transparent"
                    autoFocus
                  />
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      type="submit"
                      className="p-2 text-slate-500 hover:text-amber-600 transition-colors rounded-lg hover:bg-slate-100"
                      title="Search"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={closeSearch}
                      className="p-2 text-slate-500 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>
              <div className="border-t border-slate-200 p-6 bg-slate-50">
                <p className="text-sm text-slate-600 mb-3">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {["Gandhara Art", "Stone Fountains", "Garden Decor", "Antique Products"].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearch({ preventDefault: () => {} });
                      }}
                      className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-sm hover:bg-amber-50 hover:text-amber-700 transition-colors border border-slate-200 hover:border-amber-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Overlay */}
      {isShopDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeShopDropdown}
        />
      )}
    </>
  );
};

export default ProfessionalNavbar;
