<?php

namespace App\Modules\Place\Actions;

use App\Modules\Place\Models\Place;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UpdateOperatingHoursAction
{
    /**
     * Synchronize a place's complete weekly operating schedule.
     * Deletes omitted weekdays and upserts selected operating days.
     *
     * @param Place $place
     * @param array<int, array{day_of_week: int, opens_at: string, closes_at: string}> $hours
     * @return Collection
     */
    public function execute(Place $place, array $hours): Collection
    {
        return DB::transaction(function () use ($place, $hours) {
            $submittedDays = collect($hours)->pluck('day_of_week')->all();

            if (empty($submittedDays)) {
                // If hours: [] was submitted, delete all records (closed all week)
                $place->operatingHours()->delete();
            } else {
                // 1. Delete all existing records for omitted weekdays
                $place->operatingHours()
                    ->whereNotIn('day_of_week', $submittedDays)
                    ->delete();

                // 2. Upsert each selected operating day
                foreach ($hours as $hour) {
                    $place->operatingHours()->updateOrCreate(
                        [
                            'day_of_week' => $hour['day_of_week'],
                        ],
                        [
                            'opens_at'  => $hour['opens_at'],
                            'closes_at' => $hour['closes_at'],
                            'is_closed' => false,
                        ]
                    );
                }
            }

            // Return active operating schedule ordered by weekday (0 = Sun, ..., 6 = Sat)
            return $place->operatingHours()->orderBy('day_of_week')->get();
        });
    }
}
