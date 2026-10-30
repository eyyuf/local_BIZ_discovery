<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Place\Models\Place;
use Illuminate\Database\Eloquent\Collection;

class GetNearbyPlacesAction
{
    /**
     * Retrieve active places located within a given radius, ordered by nearest distance.
     *
     * @param float $lat User latitude in degrees
     * @param float $lng User longitude in degrees
     * @param float $radiusKm Search radius in kilometers (default: 5.0)
     * @param int $limit Maximum number of places to return (default: 20)
     * @return Collection<int, Place>
     */
    public function execute(float $lat, float $lng, float $radiusKm = 5.0, int $limit = 20): Collection
    {
        return Place::query()
            ->where('is_active', true)
            ->withinRadius($lat, $lng, $radiusKm)
            ->withDistanceTo($lat, $lng)
            ->orderBy('distance_km', 'asc')
            ->limit($limit)
            ->with(['categories', 'amenities'])
            ->get();
    }
}
