import React from 'react';
import { Clock } from 'lucide-react';
import {
  DAY_NAMES,
  getAddisDateTimeParts,
  formatTime,
  computeIsOpen,
} from '@/shared/utils/operatingHours';

export function WeeklySchedule({ operatingHours = [] }) {
  // Current day and time strictly in Africa/Addis_Ababa (East Africa Time: UTC+3)
  const { dayOfWeek: currentDayIndex, timeStr } = getAddisDateTimeParts();

  const hasHours = Array.isArray(operatingHours) && operatingHours.length > 0;
  const isOpenNow = hasHours && computeIsOpen(operatingHours);

  // Today's record in Africa/Addis_Ababa
  const todayRecord = hasHours
    ? operatingHours.find((h) => Number(h.day_of_week) === currentDayIndex)
    : null;

  const isTodayOpenSchedule = Boolean(
    todayRecord && !todayRecord.is_closed && todayRecord.opens_at && todayRecord.closes_at
  );

  // Build schedule list (0 to 6)
  const schedule = DAY_NAMES.map((name, index) => {
    const record = operatingHours.find((h) => Number(h.day_of_week) === index);

    if (!record || record.is_closed || !record.opens_at || !record.closes_at) {
      return {
        name,
        index,
        time: 'Closed',
        isToday: index === currentDayIndex,
        isClosed: true,
      };
    }

    return {
      name,
      index,
      time: `${formatTime(record.opens_at)} - ${formatTime(record.closes_at)}`,
      isToday: index === currentDayIndex,
      isClosed: false,
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

        {/* Dynamic Status Badge */}
        {!hasHours ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-[#AAA69C] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span>Hours Unavailable</span>
          </div>
        ) : isOpenNow ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open Now</span>
          </div>
        ) : isTodayOpenSchedule && timeStr < todayRecord.opens_at ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Opens at {formatTime(todayRecord.opens_at)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Closed</span>
          </div>
        )}
      </div>

      <p className="text-xs text-[#AAA69C] -mt-2">
        Local East Africa Time (EAT &bull; Africa/Addis_Ababa)
      </p>

      {/* Days Table */}
      {!hasHours ? (
        <div className="py-6 text-center text-xs text-[#AAA69C] border-t border-[#34322D]/40">
          No operating schedule has been published for this spot.
        </div>
      ) : (
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

              <span
                className={`text-xs sm:text-sm font-mono tracking-tight ${
                  item.isClosed ? 'text-[#AAA69C]/60' : 'text-[#F5F2EA]'
                }`}
              >
                {item.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WeeklySchedule;
