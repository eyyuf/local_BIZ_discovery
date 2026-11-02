<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Place\Models\Place;
use Illuminate\Database\Eloquent\Collection;

class GetNearbyPlacesAction
{
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
