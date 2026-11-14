<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Discovery\DTOs\SearchFilterDTO;
use App\Modules\Place\Models\Place;
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

        $query = Place::query()->where('is_active', true)->with('images');

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
            $now = now();
            $currentDay = $now->dayOfWeek;
            $currentTime = $now->format('H:i:s');

            $query->whereHas('operatingHours', function ($hoursQuery) use ($currentDay, $currentTime) {
                $hoursQuery->where('day_of_week', $currentDay)
                           ->where('is_closed', false)
                           ->where('opens_at', '<=', $currentTime)
                           ->where('closes_at', '>=', $currentTime);
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
