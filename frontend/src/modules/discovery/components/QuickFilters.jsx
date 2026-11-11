import React from 'react';
import { LayoutGrid, Clock, MapPin, Coffee, UtensilsCrossed, Hotel } from 'lucide-react';

export function QuickFilters({ activeFilter, onSelectFilter }) {
  const filters = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'open_now', label: 'Open Now', icon: Clock },
    { id: 'bole', label: 'Bole Area', icon: MapPin },
    { id: 'kazanchis', label: 'Kazanchis', icon: MapPin },
    { id: 'bishoftu', label: 'Bishoftu Lakes', icon: MapPin },
    { id: 'cafes', label: 'Specialty Cafes', icon: Coffee },
    { id: 'cultural_dining', label: 'Cultural Dining', icon: UtensilsCrossed },
    { id: 'lakeside_stays', label: 'Lakeside Stays', icon: Hotel },
  ];

  return (
    <div className="w-full flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
      <span className="text-xs font-mono text-[#AAA69C]/80 shrink-0 font-medium mr-1 select-none">
        Quick filters:
      </span>
      {filters.map((f) => {
        const Icon = f.icon;
        const isActive = activeFilter === f.id;

        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFilter(f.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
              isActive
                ? 'border border-white bg-white/15 text-white font-semibold shadow-sm'
                : 'border border-white/20 bg-black/40 text-[#AAA69C] hover:text-white hover:border-white/50'
            }`}
          >
            <Icon className="w-3.5 h-3.5 text-white/80 shrink-0" />
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default QuickFilters;
