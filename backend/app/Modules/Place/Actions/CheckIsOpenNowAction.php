<?php

namespace App\Modules\Place\Actions;

use App\Modules\Place\Models\Place;

class CheckIsOpenNowAction
{
    /**
     * Check if a place is currently open.
     */
    public function execute(Place $place): bool
    {
        if (! $place->is_active) {
            return false;
        }

        $now = now();
        $time = $now->format('H:i:s');
        $hours = $place->operatingHours;

        $today = $hours->firstWhere('day_of_week', $now->dayOfWeek);
        $yesterday = $hours->firstWhere('day_of_week', ($now->dayOfWeek + 6) % 7);

        // 1. Currently active during today's schedule (standard daytime or evening start of overnight)
        $openToday = $today && ! $today->is_closed && (
            $today->opens_at <= $today->closes_at
                ? $time >= $today->opens_at && $time <= $today->closes_at
                : $time >= $today->opens_at
        );

        // 2. Currently active during yesterday's overnight shift spilling into this morning
        $openYesterday = $yesterday && ! $yesterday->is_closed && $yesterday->opens_at > $yesterday->closes_at
            && $time <= $yesterday->closes_at;

        return (bool) ($openToday || $openYesterday);
    }
}
