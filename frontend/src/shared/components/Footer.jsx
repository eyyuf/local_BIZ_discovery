import React from 'react';
import { Compass, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-brand-600" />
          <span className="font-bold text-slate-800">LocalSpot Platform</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <p className="flex items-center gap-1 text-slate-400">
          Built for neighborhood discovery & local businesses
        </p>
      </div>
    </footer>
  );
}

export default Footer;

