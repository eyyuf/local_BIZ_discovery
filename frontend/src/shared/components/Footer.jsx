import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, ShieldCheck, Building2 } from 'lucide-react';
import { useAuth } from '@/modules/identity';

export function Footer() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const authPaths = ['/login', '/register', '/signup', '/oauth', '/forgot-password', '/reset-password'];
  const isAuthPage = authPaths.some((p) => location.pathname.startsWith(p));
  const isPlaceDetailPage = location.pathname.startsWith('/places/');

  if (isAuthPage || isPlaceDetailPage) {
    return null;
  }
  const neighborhoods = [
    { name: 'Bole Medhanealem', query: 'Bole' },
    { name: 'Kazanchis', query: 'Kazanchis' },
    { name: 'Piassa', query: 'Piassa' },
    { name: 'Sarbet', query: 'Sarbet' },
    { name: 'Bishoftu Lakes', query: 'Bishoftu' },
    { name: 'Old Airport', query: 'Old Airport' },
    { name: 'CMC & Ayat', query: 'CMC' },
  ];

  return (
    <footer className="w-full bg-[#0D0D0C] border-t border-white/[0.08] text-[#AAA69C] text-xs pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/[0.06]">
          {/* Brand info */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full border border-white/20 bg-[#151513] flex items-center justify-center text-white transition-colors group-hover:border-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white font-display">
                Local Spot ET
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#AAA69C] max-w-sm">
              Discover authentic Ethiopian dining, specialty cafes, cultural landmarks, lakeside getaways, and verified neighborhood businesses.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#AAA69C]/80 pt-1">
              <ShieldCheck className="w-4 h-4 text-white/70 shrink-0" />
              <span>Verified local listings &amp; PostGIS proximity</span>
            </div>
          </div>

          {/* Discovery Column */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white font-display">
              Discovery
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Curated Explore Feed
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition">
                  Category Directory
                </Link>
              </li>
              <li>
                <Link to="/nearby" className="hover:text-white transition">
                  Live Proximity Map
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition">
                  Multi-Filter Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Neighborhoods Column */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white font-display">
              Popular Neighborhoods
            </h4>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {neighborhoods.map((n) => (
                <Link
                  key={n.name}
                  to={`/search?q=${encodeURIComponent(n.query)}`}
                  className="px-3 py-1 rounded-full text-[11px] bg-[#16161A] border border-white/10 text-[#AAA69C] hover:text-white hover:border-white/40 transition"
                >
                  {n.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Business Owners Column */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white font-display">
              For Business Owners
            </h4>
            <p className="text-xs leading-relaxed text-[#AAA69C]">
              Reach thousands of residents, expats, and visitors exploring your neighborhood every day.
            </p>
            <div className="pt-1">
              <Link
                to={isAuthenticated ? '/profile?tab=businesses' : '/login'}
                className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-white/80 transition"
              >
                <Building2 className="w-4 h-4 text-white/70" />
                <span>Manage your place listing</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#AAA69C]/70">
          <p>&copy; {new Date().getFullYear()} Local Spot Ethiopia. Built for authentic local discovery.</p>
          <div className="flex items-center gap-6">
            <Link to="/search" className="hover:text-white transition">
              Explore
            </Link>
            <Link to="/search" className="hover:text-white transition">
              Categories
            </Link>
            <Link to="/nearby" className="hover:text-white transition">
              Nearby Radar
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
