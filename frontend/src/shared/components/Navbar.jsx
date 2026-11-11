import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/modules/identity';
import {
  Compass,
  Search,
  LayoutGrid,
  MapPin,
  Bookmark,
  Building2,
  User,
  LogOut,
  X,
  Menu,
} from 'lucide-react';
import { QuickFilters } from '@/modules/discovery/components/QuickFilters';
import { NearMeFloatingPill } from '@/modules/discovery/components/NearMeFloatingPill';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const authPaths = ['/login', '/register', '/signup', '/oauth', '/forgot-password', '/reset-password'];
  const isAuthPage = authPaths.some((p) => location.pathname.startsWith(p));
  const isPlaceDetailPage = location.pathname.startsWith('/places/');

  const activeFilter = searchParams.get('filter') || 'all';

  const handleSelectFilter = (filterId) => {
    if (!isHome) {
      if (filterId === 'all') {
        navigate('/');
      } else {
        navigate(`/?filter=${filterId}`);
      }
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (filterId === 'all') {
      nextParams.delete('filter');
    } else {
      nextParams.set('filter', filterId);
    }
    setSearchParams(nextParams);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const prevScrollY = lastScrollYRef.current;

      if (currentScrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY < 120) {
        setIsVisible(true);
      } else if (currentScrollY > prevScrollY && currentScrollY - prevScrollY > 10) {
        setIsVisible(false);
      } else if (prevScrollY - currentScrollY > 10) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Suppress completely on place detail and auth routes per architecture specification
  if (isPlaceDetailPage || isAuthPage) {
    return null;
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-none outline-none ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'bg-[#0D0D0C]/90 backdrop-blur-md shadow-2xl shadow-black/80'
          : isHome
          ? 'bg-transparent'
          : 'bg-[#0D0D0C]/90 backdrop-blur-md'
      }`}
    >
      {/* Row 1: Primary Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3 lg:gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 bg-black/45 flex items-center justify-center text-white backdrop-blur-md group-hover:border-white transition">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-display flex items-center gap-1.5 whitespace-nowrap">
            Local Spot
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
          </span>
        </Link>

        {/* Global Search Input (Centered frosted pill) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#AAA69C] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spots, cafes, dining, hotels..."
              aria-label="Search places"
              className="w-full h-10 rounded-full border border-white/20 bg-black/50 pl-11 pr-4 text-xs text-[#F5F2EA] placeholder:text-[#AAA69C]/65 backdrop-blur-md focus:border-white focus:outline-none transition font-sans"
            />
          </div>
        </form>

        {/* Navigation Quick Actions: Individual Frosted Pills */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link
            to="/search"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-xs font-semibold text-[#F5F2EA] hover:border-white hover:text-white transition"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#AAA69C]" />
            <span>Browse</span>
          </Link>

          <Link
            to="/nearby"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-xs font-semibold text-[#F5F2EA] hover:border-white hover:text-white transition"
          >
            <MapPin className="w-3.5 h-3.5 text-[#AAA69C]" />
            <span>Nearby</span>
          </Link>

          <Link
            to="/saved"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-xs font-semibold text-[#F5F2EA] hover:border-white hover:text-white transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#AAA69C]" />
            <span>Collections</span>
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-xs font-semibold text-[#F5F2EA] hover:border-white hover:text-white transition"
          >
            <Building2 className="w-3.5 h-3.5 text-[#AAA69C]" />
            <span>Business</span>
          </Link>

          {/* User / Sign In Pill */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 pl-1">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/25 bg-black/45 backdrop-blur-md text-xs font-bold text-white hover:border-white transition"
              >
                <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[9px] text-white">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[100px] truncate">{user?.name}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-full text-[#AAA69C] hover:text-white hover:bg-white/10 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-xs font-semibold text-[#F5F2EA] hover:border-white hover:text-white transition"
            >
              <User className="w-3.5 h-3.5 text-[#AAA69C]" />
              <span>Sign in</span>
            </Link>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/search"
            aria-label="Search"
            className="p-2 rounded-full border border-white/20 bg-black/40 text-[#AAA69C] hover:text-white transition"
          >
            <Search className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 rounded-full border border-white/20 bg-black/40 text-white hover:border-white transition"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Row 2: Integrated Quick Filters and Near Me Pill on Homepage */}
      {isHome && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 pt-0.5 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <QuickFilters
              activeFilter={activeFilter}
              onSelectFilter={handleSelectFilter}
            />
          </div>
          <div className="shrink-0 hidden md:block">
            <NearMeFloatingPill />
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-none bg-[#0D0D0C]/95 backdrop-blur-2xl px-5 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#AAA69C] absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spots, cafes, dining, hotels..."
                className="w-full h-10 rounded-full border border-white/20 bg-black/60 pl-11 pr-4 text-xs text-[#F5F2EA] placeholder:text-[#AAA69C]/65 focus:border-white focus:outline-none transition"
              />
            </div>
          </form>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white"
            >
              <LayoutGrid className="w-4 h-4 text-[#AAA69C]" />
              <span>Browse All</span>
            </Link>
            <Link
              to="/nearby"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white"
            >
              <MapPin className="w-4 h-4 text-[#AAA69C]" />
              <span>Nearby Radar</span>
            </Link>
            <Link
              to="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white"
            >
              <Bookmark className="w-4 h-4 text-[#AAA69C]" />
              <span>Collections</span>
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white"
            >
              <Building2 className="w-4 h-4 text-[#AAA69C]" />
              <span>Business Listing</span>
            </Link>
          </div>

          <div className="pt-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs font-bold text-white"
                >
                  <User className="w-4 h-4 text-[#AAA69C]" />
                  <span>{user?.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-red-400 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign in to Local Spot</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
