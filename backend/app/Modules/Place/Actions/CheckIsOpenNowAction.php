<?php

namespace App\Modules\Place\Actions;

use App\Modules\Place\Models\Place;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use DateTimeInterface;

class CheckIsOpenNowAction
{
    public const BUSINESS_TIMEZONE = 'Africa/Addis_Ababa';

    /**
     * Check if a place is currently open based on its operating hours in Africa/Addis_Ababa.
     *
     * @param Place $place
     * @param DateTimeInterface|null $at Specific time to evaluate against (defaults to now in Africa/Addis_Ababa)
     * @return bool
     */
    public function execute(Place $place, ?DateTimeInterface $at = null): bool
    {
        if (! $place->is_active) {
            return false;
        }

        // Use loaded relation or retrieve from database
        $hours = $place->relationLoaded('operatingHours')
            ? $place->operatingHours
            : $place->operatingHours()->get();

        if ($hours->isEmpty()) {
            return false;
        }

        // Always calculate in Ethiopia's timezone (Africa/Addis_Ababa)
        $now = $at !== null
            ? Carbon::instance($at instanceof \DateTime ? $at : new \DateTime($at->format('c')))->setTimezone(self::BUSINESS_TIMEZONE)
            : Carbon::now(self::BUSINESS_TIMEZONE);

        $currentTime = $now->format('H:i:s');
        $currentDay = $now->dayOfWeek; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        $yesterdayDay = ($currentDay + 6) % 7;

        $today = $hours->firstWhere('day_of_week', $currentDay);
        $yesterday = $hours->firstWhere('day_of_week', $yesterdayDay);

        // 1. Check shift starting today
        $openToday = false;
        if ($today && ! $today->is_closed && ! empty($today->opens_at) && ! empty($today->closes_at)) {
            $opensAt = $this->normalizeTime($today->opens_at);
            $closesAt = $this->normalizeTime($today->closes_at);

            if ($opensAt < $closesAt) {
                // Standard daytime schedule:
                // Open at exact opening time, open during hours, closed at exact closing time
                $openToday = ($currentTime >= $opensAt && $currentTime < $closesAt);
            } elseif ($opensAt > $closesAt) {
                // Overnight schedule starting today (e.g. 18:00 to 02:00):
                // In the evening portion of today (from 18:00:00 to 23:59:59)
                $openToday = ($currentTime >= $opensAt);
            }
        }

        // 2. Check overnight shift starting yesterday that extends into today
        $openYesterday = false;
        if ($yesterday && ! $yesterday->is_closed && ! empty($yesterday->opens_at) && ! empty($yesterday->closes_at)) {
            $yesterdayOpensAt = $this->normalizeTime($yesterday->opens_at);
            $yesterdayClosesAt = $this->normalizeTime($yesterday->closes_at);

            if ($yesterdayOpensAt > $yesterdayClosesAt) {
                // In the early morning portion of today before yesterday's closing time
                // Closed at exact closing time
                $openYesterday = ($currentTime < $yesterdayClosesAt);
            }
        }

        return (bool) ($openToday || $openYesterday);
    }

    /**
     * Normalize time string to H:i:s format.
     */
    protected function normalizeTime(string $time): string
    {
        $parts = explode(':', trim($time));
        $h = str_pad($parts[0] ?? '00', 2, '0', STR_PAD_LEFT);
        $m = str_pad($parts[1] ?? '00', 2, '0', STR_PAD_LEFT);
        $s = str_pad($parts[2] ?? '00', 2, '0', STR_PAD_LEFT);

        return "{$h}:{$m}:{$s}";
    }
}
