import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Search, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-28 pb-20 max-w-xl mx-auto space-y-6">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/20 bg-[#161619] flex items-center justify-center text-white/80 mx-auto backdrop-blur-md shadow-2xl">
        <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-white/60 animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-mono tracking-widest text-[#AAA69C] uppercase">
          Error 404 &bull; Page Not Found
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
          Trail Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#AAA69C] max-w-md mx-auto leading-relaxed pt-1">
          The spot, collection, or trail you're looking for doesn't exist or has moved across the city.
        </p>
      </div>

      {/* Action buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-extrabold text-xs tracking-wide shadow-2xl hover:bg-[#F5F2EA] active:scale-95 transition cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-black" />
          <span>Return to Discovery</span>
        </Link>

        <Link
          to="/search"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-black/40 text-white font-semibold text-xs tracking-wide hover:border-white hover:bg-black/60 active:scale-95 transition cursor-pointer backdrop-blur-md"
        >
          <Search className="w-3.5 h-3.5 text-[#AAA69C]" />
          <span>Explore Spots</span>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;