/**
 * Business Operating Hours & Timezone Utilities
 * Enforces Africa/Addis_Ababa (East Africa Time: UTC+3) across all business operating status determinations.
 */

export const BUSINESS_TIMEZONE = 'Africa/Addis_Ababa';

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Extract time and day-of-week strictly in Africa/Addis_Ababa.
 */
export function getAddisDateTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;

  const weekdayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const weekdayStr = get('weekday');
  const dayOfWeek = weekdayMap[weekdayStr] ?? 0;
  const hour = Number(get('hour') || 0);
  const minute = Number(get('minute') || 0);
  const second = Number(get('second') || 0);

  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

  return {
    dayOfWeek,
    timeStr,
    hour,
    minute,
    second,
  };
}

/**
 * Normalize time string to HH:mm:ss.
 */
export function normalizeTime(timeStr) {
  if (!timeStr) return '';
  const parts = String(timeStr).trim().split(':');
  const h = String(parts[0] || '00').padStart(2, '0');
  const m = String(parts[1] || '00').padStart(2, '0');
  const s = String(parts[2] || '00').padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Format time to user-friendly 12-hour format: "10:30 AM", "11:00 PM".
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours)) return '';
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes ? String(minutes).padStart(2, '0') : '00';
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Pure client-side check if a place is open in Africa/Addis_Ababa.
 */
export function computeIsOpen(operatingHours = [], targetDate = new Date()) {
  if (!Array.isArray(operatingHours) || operatingHours.length === 0) {
    return false;
  }

  const { dayOfWeek, timeStr } = getAddisDateTimeParts(targetDate);
  const yesterdayDayOfWeek = (dayOfWeek + 6) % 7;

  const today = operatingHours.find((h) => Number(h.day_of_week) === dayOfWeek);
  const yesterday = operatingHours.find((h) => Number(h.day_of_week) === yesterdayDayOfWeek);

  let openToday = false;
  if (today && !today.is_closed && today.opens_at && today.closes_at) {
    const opensAt = normalizeTime(today.opens_at);
    const closesAt = normalizeTime(today.closes_at);

    if (opensAt < closesAt) {
      // Daytime: open at opens_at, open during hours, closed at exact closes_at
      openToday = timeStr >= opensAt && timeStr < closesAt;
    } else if (opensAt > closesAt) {
      // Overnight start today
      openToday = timeStr >= opensAt;
    }
  }

  let openYesterday = false;
  if (yesterday && !yesterday.is_closed && yesterday.opens_at && yesterday.closes_at) {
    const yesterdayOpensAt = normalizeTime(yesterday.opens_at);
    const yesterdayClosesAt = normalizeTime(yesterday.closes_at);

    if (yesterdayOpensAt > yesterdayClosesAt) {
      // Overnight morning spillover from yesterday
      openYesterday = timeStr < yesterdayClosesAt;
    }
  }

  return Boolean(openToday || openYesterday);
}

/**
 * Authoritative operating status for any place.
 * Prefers backend is_open when available, computes in Africa/Addis_Ababa as fallback,
 * and NEVER defaults missing hours to Open.
 */
export function getOperatingStatus(place) {
  if (!place) {
    return {
      isOpen: false,
      statusText: 'Closed',
      label: 'Closed',
      tone: 'closed',
      hasHours: false,
    };
  }

  if (place.is_active === false) {
    return {
      isOpen: false,
      statusText: 'Temporarily Closed',
      label: 'Temporarily Closed',
      tone: 'closed',
      hasHours: false,
    };
  }

  const hours = place.operating_hours || place.operatingHours || [];
  const hasHours = Array.isArray(hours) && hours.length > 0;

  let isOpen = false;

  if (typeof place.is_open === 'boolean') {
    isOpen = place.is_open;
  } else if (hasHours) {
    isOpen = computeIsOpen(hours);
  } else {
    // Missing hours: NEVER default to Open
    return {
      isOpen: false,
      statusText: 'Hours unavailable',
      label: 'Hours unavailable',
      tone: 'neutral',
      hasHours: false,
    };
  }

  return {
    isOpen,
    statusText: isOpen ? 'Open Now' : 'Closed',
    label: isOpen ? 'Open Now' : 'Closed',
    tone: isOpen ? 'open' : 'closed',
    hasHours,
  };
}
