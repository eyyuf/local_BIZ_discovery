import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Search, MapPin, Bookmark, User } from 'lucide-react';
import { useAuth } from '@/modules/identity';

export function MobileBottomNav() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Suppress navigation on authentication and password reset pages
  const authPaths = [
    '/login',
    '/register',
    '/signup',
    '/oauth',
    '/forgot-password',
    '/reset-password',
  ];
  const isAuthPage = authPaths.some((p) => location.pathname.startsWith(p));

  if (isAuthPage) {
    return null;
  }

  const currentPath = location.pathname;

  const navItems = [
    {
      id: 'explore',
      label: 'Explore',
      icon: Compass,
      to: '/',
      isActive: currentPath === '/',
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      to: '/search',
      isActive: currentPath === '/search' || currentPath === '/places',
    },
    {
      id: 'nearby',
      label: 'Nearby',
      icon: MapPin,
      to: '/nearby',
      isActive: currentPath === '/nearby',
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: Bookmark,
      to: isAuthenticated ? '/saved' : '/login',
      state: isAuthenticated ? undefined : { from: { pathname: '/saved' } },
      isActive: currentPath === '/saved',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      to: isAuthenticated ? '/profile' : '/login',
      state: isAuthenticated ? undefined : { from: { pathname: '/profile' } },
      isActive: currentPath === '/profile',
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0D0D0C]/90 backdrop-blur-md border-t border-white/[0.08] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-14 sm:h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.id}
              to={item.to}
              state={item.state}
              className={`flex flex-col items-center justify-center h-full py-1.5 transition-colors group select-none active:scale-95 ${
                active ? 'text-white' : 'text-[#AAA69C]/70 hover:text-white'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    active
                      ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.25)]'
                      : 'text-[#AAA69C]/80 group-hover:text-white'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight font-sans transition-colors ${
                  active ? 'font-bold text-white' : 'font-medium text-[#AAA69C]/80 group-hover:text-white'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;

