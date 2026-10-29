<?php

namespace App\Modules\Discovery\Actions;

use App\Modules\Place\Models\Place;
use Illuminate\Database\Eloquent\Collection;

class GetNearbyPlacesAction
{
    public function execute(float $lat, float $lng, float $radiusKm = 5.0, int $limit = 20): Collection
    {
        // TODO: Implement PostGIS nearby proximity query
    }
}
