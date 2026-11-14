import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import { useAuth } from '@/modules/identity';

export function PersonalizedRadar() {
  const { isAuthenticated, user } = useAuth();

  const tasteTags = ['Artisanal Roasters', 'Traditional Wot', 'Highland Stays'];

  return (
    <section className="w-full">
      <div className="glass-card rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#34322D] bg-[#151513]/90 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left info */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-black/40 text-[10px] font-mono uppercase tracking-widest text-white/90">
              Personalized Radar
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Recommendations made just for you
            </h2>

            <p className="text-xs sm:text-sm text-[#AAA69C] leading-relaxed max-w-xl">
              {isAuthenticated
                ? `Welcome back ${user?.name || ''}! Local Spot is tailoring suggestions based on your bookmarked traditional kitchens, specialty cafes, and highland escapes.`
                : 'Sign in to unlock your personal taste radar. Local Spot analyzes your favorite roasters, traditional kitchens, and weekend vibes to surface fresh daily recommendations.'}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {tasteTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-black/30 text-[#AAA69C]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right action & preview */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center space-y-4">
            <div className="relative w-48 h-28 rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#1C1C1F] to-[#121214] shadow-xl flex flex-col items-center justify-center p-4">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.05] border border-white/10 mb-1">
                <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-ping opacity-75" />
                <Compass className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-white/80 font-bold">
                <Sparkles className="w-3 h-3 text-[#F5B301]" />
                <span>Taste Radar</span>
              </div>
            </div>

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-full border border-white/40 bg-white/10 hover:bg-white hover:text-black text-white text-xs font-bold tracking-wider uppercase transition active:scale-95 text-center"
              >
                Sign In to LocalSpot
              </Link>
            ) : (
              <Link
                to="/saved"
                className="px-6 py-2.5 rounded-full border border-white/40 bg-white/10 hover:bg-white hover:text-black text-white text-xs font-bold tracking-wider uppercase transition active:scale-95 text-center"
              >
                View Saved Spots
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PersonalizedRadar;

