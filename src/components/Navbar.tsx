import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { SmartConnectLogo } from './SmartConnectLogo.tsx';
import {
  ShoppingCart,
  Search,
  Heart,
  ShieldCheck,
  Menu,
  X,
  User,
  ArrowRight,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    navigateTo,
    cartCount,
    wishlist,
    setIsCartOpen,
    settings,
    searchQuery,
    setSearchQuery,
    adminToken,
    customerUser,
    categories,
    setSelectedCategory,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileCategoriesExpanded, setMobileCategoriesExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (view: 'home' | 'shop' | 'categories' | 'about' | 'contact') => {
    if (view === 'shop') {
      setSelectedCategory('all');
    }
    navigateTo(view);
    setCategoriesDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('shop');
      setShowSearchInput(false);
      setMobileMenuOpen(false);
    }
  };

  const visibleCategories = categories.filter((c) => c.isVisible);

  return (
    <>
      {/* Top Announcement Bar */}
      {settings?.announcementBar.enabled && (
        <div className="bg-[#121824] border-b border-[#c5a880]/20 text-slate-300 text-xs py-2 px-4 font-medium tracking-wide">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="text-[#c5a880]">✦</span>
              <span>{settings.announcementBar.text}</span>
            </div>

            {/* Quick Social Channels on Desktop */}
            {settings.socials && (
              <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
                <span className="text-[#c5a880] text-[10px] uppercase font-semibold tracking-wider">Follow Us:</span>
                {settings.socials.instagram && (
                  <a
                    href={settings.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#c5a880] transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {settings.socials.facebook && (
                  <a
                    href={settings.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#c5a880] transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {settings.socials.tiktok && (
                  <a
                    href={settings.socials.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#c5a880] transition-colors"
                  >
                    TikTok
                  </a>
                )}
                {settings.socials.youtube && (
                  <a
                    href={settings.socials.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#c5a880] transition-colors"
                  >
                    YouTube
                  </a>
                )}
                {settings.socials.twitter && (
                  <a
                    href={settings.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#c5a880] transition-colors"
                  >
                    X
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Sticky Navigation */}
      <header className="sticky top-0 z-40 bg-[#0b0f17]/90 backdrop-blur-md border-b border-[#1e293b]/80 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center text-left focus:outline-none group transition-transform duration-200 hover:scale-[1.01] shrink min-w-0"
          >
            <SmartConnectLogo
              customLogoUrl={settings?.logoUrl}
              storeName={settings?.storeName}
              tagline={settings?.tagline}
              size="md"
              showTagline={true}
            />
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium tracking-wide">
            {/* Home */}
            <button
              onClick={() => handleNavClick('home')}
              className={`relative py-1 transition-colors whitespace-nowrap ${
                currentView === 'home'
                  ? 'text-[#c5a880] font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
              {currentView === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a880] rounded-full" />
              )}
            </button>

            {/* Shop (All Products) */}
            <button
              onClick={() => handleNavClick('shop')}
              className={`relative py-1 transition-colors whitespace-nowrap ${
                currentView === 'shop'
                  ? 'text-[#c5a880] font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Shop
              {currentView === 'shop' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a880] rounded-full" />
              )}
            </button>

            {/* Categories (with Dropdown) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <button
                onClick={() => handleNavClick('categories')}
                className={`relative py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentView === 'categories'
                    ? 'text-[#c5a880] font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    categoriesDropdownOpen ? 'rotate-180 text-[#c5a880]' : 'text-slate-400'
                  }`}
                />
                {currentView === 'categories' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a880] rounded-full" />
                )}
              </button>

              {/* Categories Dropdown Popover */}
              {categoriesDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 w-72 animate-in fade-in duration-150">
                  <div className="bg-[#101724] border border-[#1e293b] rounded-2xl shadow-2xl p-3 space-y-1 backdrop-blur-xl">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800">
                      <span>Curated Departments</span>
                      <span className="text-[#c5a880]">{visibleCategories.length} Categories</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1 space-y-0.5 scrollbar-none">
                      {visibleCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            navigateTo('shop');
                            setCategoriesDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <span className="font-medium group-hover:text-[#c5a880] transition-colors">
                              {cat.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {cat.productCount ?? 0}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleNavClick('categories')}
                        className="w-full py-2 px-3 rounded-xl bg-[#c5a880]/15 hover:bg-[#c5a880]/25 text-[#c5a880] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>All Categories Showcase</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <button
              onClick={() => handleNavClick('about')}
              className={`relative py-1 transition-colors whitespace-nowrap ${
                currentView === 'about'
                  ? 'text-[#c5a880] font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              About
              {currentView === 'about' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a880] rounded-full" />
              )}
            </button>

            {/* Contact */}
            <button
              onClick={() => handleNavClick('contact')}
              className={`relative py-1 transition-colors whitespace-nowrap ${
                currentView === 'contact'
                  ? 'text-[#c5a880] font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Contact
              {currentView === 'contact' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a880] rounded-full" />
              )}
            </button>
          </nav>

          {/* Zone 3: Actions (Search, Wishlist, Cart, Account, Admin) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Toggle / Form */}
            {showSearchInput ? (
              <form
                onSubmit={handleSearchSubmit}
                className="relative hidden sm:flex items-center"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search watches, perfumes..."
                  autoFocus
                  className="w-48 lg:w-64 pl-3 pr-8 py-1.5 text-xs bg-[#161f30] text-white border border-[#c5a880]/30 rounded-lg focus:outline-none focus:border-[#c5a880] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSearchInput(false)}
                  className="absolute right-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
                title="Search Products"
                aria-label="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={() => navigateTo('shop')}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors relative"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c5a880]" />
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors flex items-center"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold text-[#0b0f17] bg-[#c5a880] rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Customer Account View Trigger (Visible on Mobile & Desktop) */}
            <button
              onClick={() => navigateTo('account')}
              className={`p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors flex items-center relative ${
                currentView === 'account' ? 'text-[#c5a880] bg-[#c5a880]/15' : ''
              }`}
              title={customerUser ? `Account: ${customerUser.fullName || customerUser.email}` : "Customer Account"}
              aria-label="Customer Account"
            >
              <User className="w-5 h-5" />
              {customerUser && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0b0f17]" />
              )}
            </button>

            {/* Admin Panel Button (Desktop Only, Removed from Mobile Front) */}
            <button
              onClick={() => navigateTo('admin')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                adminToken
                  ? 'bg-[#c5a880]/15 text-[#c5a880] border-[#c5a880]/40 hover:bg-[#c5a880]/25'
                  : 'text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'
              }`}
              title="Store Admin Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Admin</span>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-200" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0e1420] border-b border-[#1e293b] px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search store..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#162030] text-white border border-[#c5a880]/30 rounded-lg focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </form>

            <div className="flex flex-col gap-2">
              {/* Home */}
              <button
                onClick={() => handleNavClick('home')}
                className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-left text-sm font-medium transition-colors ${
                  currentView === 'home'
                    ? 'bg-[#c5a880]/15 text-[#c5a880] font-semibold border border-[#c5a880]/30'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-[#c5a880]'
                }`}
              >
                <span>Home</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Shop (All Products) */}
              <button
                onClick={() => handleNavClick('shop')}
                className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-left text-sm font-medium transition-colors ${
                  currentView === 'shop'
                    ? 'bg-[#c5a880]/15 text-[#c5a880] font-semibold border border-[#c5a880]/30'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-[#c5a880]'
                }`}
              >
                <span>Shop (All Products)</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Categories Section */}
              <div className="rounded-xl border border-slate-800 bg-[#121929]/50 overflow-hidden">
                <div className="flex items-center justify-between py-2.5 px-3">
                  <button
                    onClick={() => handleNavClick('categories')}
                    className={`flex-1 text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                      currentView === 'categories'
                        ? 'text-[#c5a880] font-semibold'
                        : 'text-slate-200 hover:text-[#c5a880]'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-[#c5a880]" />
                    <span>Product Categories</span>
                  </button>
                  <button
                    onClick={() => setMobileCategoriesExpanded(!mobileCategoriesExpanded)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        mobileCategoriesExpanded ? 'rotate-180 text-[#c5a880]' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Expanded categories sub-list */}
                {mobileCategoriesExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-1">
                    <button
                      onClick={() => handleNavClick('categories')}
                      className="w-full py-1.5 px-2.5 rounded-lg text-left text-xs text-[#c5a880] bg-[#c5a880]/10 font-medium flex items-center justify-between mb-1"
                    >
                      <span>Explore All Departments</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {visibleCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          navigateTo('shop');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {cat.productCount ?? 0} items
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* About */}
              <button
                onClick={() => handleNavClick('about')}
                className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-left text-sm font-medium transition-colors ${
                  currentView === 'about'
                    ? 'bg-[#c5a880]/15 text-[#c5a880] font-semibold border border-[#c5a880]/30'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-[#c5a880]'
                }`}
              >
                <span>About Us</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Contact */}
              <button
                onClick={() => handleNavClick('contact')}
                className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-left text-sm font-medium transition-colors ${
                  currentView === 'contact'
                    ? 'bg-[#c5a880]/15 text-[#c5a880] font-semibold border border-[#c5a880]/30'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-[#c5a880]'
                }`}
              >
                <span>Contact Us</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  navigateTo('account');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-left text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-[#c5a880]"
              >
                <span>My Account & Orders</span>
                <User className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  navigateTo('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-left text-sm font-medium text-[#c5a880] bg-[#c5a880]/10 border border-[#c5a880]/30"
              >
                <span>Admin Portal</span>
                <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
              </button>
            </div>

            {/* Mobile Social Links */}
            {settings?.socials && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">Connect With Us:</span>
                <div className="flex flex-wrap gap-2">
                  {settings.socials.instagram && (
                    <a
                      href={settings.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:text-[#c5a880]"
                    >
                      Instagram
                    </a>
                  )}
                  {settings.socials.facebook && (
                    <a
                      href={settings.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:text-[#c5a880]"
                    >
                      Facebook
                    </a>
                  )}
                  {settings.socials.tiktok && (
                    <a
                      href={settings.socials.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:text-[#c5a880]"
                    >
                      TikTok
                    </a>
                  )}
                  {settings.socials.youtube && (
                    <a
                      href={settings.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:text-[#c5a880]"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
