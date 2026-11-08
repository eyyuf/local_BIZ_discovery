import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/identity';
import { Compass, Tag, Bookmark, User, LogOut, LogIn, UserPlus, Menu, X, Ticket } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            Local<span className="text-brand-600">Spot</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            Explore
          </Link>
          <Link
            to="/deals"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-slate-400" />
            Deals & Vouchers
          </Link>
        </nav>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                  {user?.name || 'My Account'}
                </span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile & Bookmarks
                  </Link>

                  <Link
                    to="/my-claims"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Ticket className="w-4 h-4 text-slate-400" />
                    My Claimed Vouchers
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand-600/20 transition flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            Explore
          </Link>
          <Link
            to="/deals"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Tag className="w-4 h-4 text-slate-400" />
            Deals & Vouchers
          </Link>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profile ({user?.name})
                </Link>
                <Link
                  to="/my-claims"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Ticket className="w-4 h-4 text-slate-400" />
                  My Vouchers
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
