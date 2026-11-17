import React from 'react';
import { Clock } from 'lucide-react';

export function WeeklySchedule({ operatingHours = [] }) {
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Today in EAT (East Africa Time: UTC+3)
  const currentDayIndex = new Date().getDay();

  // Helper to format "10:30" -> "10:30 AM" or "23:00" -> "11:00 PM"
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes ? String(minutes).padStart(2, '0') : '00';
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  // Build schedule list (0 to 6)
  const schedule = dayNames.map((name, index) => {
    const record = operatingHours.find((h) => Number(h.day_of_week) === index);
    if (!record || record.is_closed) {
      return {
        name,
        index,
        time: record?.is_closed ? 'Closed' : '10:30 AM - 11:00 PM',
        isToday: index === currentDayIndex,
      };
    }

    return {
      name,
      index,
      time: `${formatTime(record.opens_at)} - ${formatTime(record.closes_at)}`,
      isToday: index === currentDayIndex,
    };
  });

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#34322D] bg-[#151513]/90 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-white/80" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
            Weekly Schedule
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Open Today</span>
        </div>
      </div>

      <p className="text-xs text-[#AAA69C] -mt-2">
        Local East Africa Time (EAT)
      </p>

      {/* Days Table */}
      <div className="divide-y divide-[#34322D]/40 pt-1">
        {schedule.map((item) => (
          <div
            key={item.name}
            className={`flex items-center justify-between py-3 px-3 rounded-xl transition-colors ${
              item.isToday
                ? 'bg-[#1D1C19] border border-white/10 text-white font-bold my-1'
                : 'text-[#AAA69C] hover:text-white/90'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xs sm:text-sm">{item.name}</span>
              {item.isToday && (
                <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-black tracking-wider uppercase">
                  Today
                </span>
              )}
            </div>

            <span className="text-xs sm:text-sm font-mono tracking-tight">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklySchedule;

