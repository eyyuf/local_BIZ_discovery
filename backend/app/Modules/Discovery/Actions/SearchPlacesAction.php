<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Discovery\DTOs\SearchFilterDTO;
use App\Modules\Place\Actions\CheckIsOpenNowAction;
use App\Modules\Place\Models\Place;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SearchPlacesAction
{
    /**
     * Search and filter places using keyword, category, PostGIS location, open status, and sorting.
     *
     * @param SearchFilterDTO|array $filters
     * @return LengthAwarePaginator
     */
    public function execute(SearchFilterDTO|array $filters): LengthAwarePaginator
    {
        $filters = $filters instanceof SearchFilterDTO ? $filters->toArray() : $filters;

        $query = Place::query()->where('is_active', true)->with(['images', 'categories', 'operatingHours']);

        if (!empty($filters['q'])) {
            $searchTerm = $filters['q'];
            $query->where(function ($subQuery) use ($searchTerm) {
                $subQuery->where('name', 'ILIKE', "%{$searchTerm}%")
                         ->orWhere('description', 'ILIKE', "%{$searchTerm}%");
            });
        }

        if (!empty($filters['category'])) {
            $query->whereHas('categories', function ($catQuery) use ($filters) {
                $catQuery->where('slug', $filters['category']);
            });
        }

        $hasCoords = !empty($filters['lat']) && !empty($filters['lng']);

        if ($hasCoords) {
            $lat = (float) $filters['lat'];
            $lng = (float) $filters['lng'];

            $query->withDistanceTo($lat, $lng);

            if (!empty($filters['radius'])) {
                $query->withinRadius($lat, $lng, (float) $filters['radius']);
            }
        }

        if (!empty($filters['open_now'])) {
            $now = Carbon::now(CheckIsOpenNowAction::BUSINESS_TIMEZONE);
            $currentDay = $now->dayOfWeek;
            $yesterdayDay = ($now->dayOfWeek + 6) % 7;
            $currentTime = $now->format('H:i:s');

            $query->whereHas('operatingHours', function ($hoursQuery) use ($currentDay, $yesterdayDay, $currentTime) {
                $hoursQuery->where(function ($sub) use ($currentDay, $yesterdayDay, $currentTime) {
                    // 1. Shift starting today
                    $sub->where(function ($todayShift) use ($currentDay, $currentTime) {
                        $todayShift->where('day_of_week', $currentDay)
                                   ->where('is_closed', false)
                                   ->whereNotNull('opens_at')
                                   ->whereNotNull('closes_at')
                                   ->where(function ($t) use ($currentTime) {
                                       // Daytime schedule: opens_at < closes_at, opens_at <= currentTime, closes_at > currentTime
                                       $t->where(function ($daytime) use ($currentTime) {
                                           $daytime->whereColumn('opens_at', '<', 'closes_at')
                                                   ->where('opens_at', '<=', $currentTime)
                                                   ->where('closes_at', '>', $currentTime);
                                       })
                                       // Overnight schedule starting today: opens_at > closes_at, opens_at <= currentTime
                                       ->orWhere(function ($overnightStart) use ($currentTime) {
                                           $overnightStart->whereColumn('opens_at', '>', 'closes_at')
                                                          ->where('opens_at', '<=', $currentTime);
                                       });
                                   });
                    })
                    // 2. Overnight shift starting yesterday extending into today: opens_at > closes_at, currentTime < closes_at
                    ->orWhere(function ($yesterdayShift) use ($yesterdayDay, $currentTime) {
                        $yesterdayShift->where('day_of_week', $yesterdayDay)
                                       ->where('is_closed', false)
                                       ->whereNotNull('opens_at')
                                       ->whereNotNull('closes_at')
                                       ->whereColumn('opens_at', '>', 'closes_at')
                                       ->where('closes_at', '>', $currentTime);
                    });
                });
            });
        }

        $sortBy = $filters['sort_by'] ?? 'newest';

        if ($sortBy === 'distance' && $hasCoords) {
            $query->orderBy('distance_km', 'asc');
        } else {
            $query->latest();
        }

        $perPage = max(1, min((int) ($filters['per_page'] ?? 15), 50));

        return $query->paginate($perPage);
    }
}
