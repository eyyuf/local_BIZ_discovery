<?php

namespace App\Modules\Place\Services;

use App\Modules\Place\Contracts\PlaceQueryInterface;
use App\Modules\Place\DTOs\PlaceSummaryDTO;
use App\Modules\Place\Models\Place;

class PlaceQueryService implements PlaceQueryInterface
{
    public function isPlaceOpen(int $placeId): bool
    {
        $place = Place::find($placeId);

        return $place ? (bool) $place->is_active : false;
    }

    public function isPlaceOwner(int $userId, int $placeId): bool
    {
        return Place::where('id', $placeId)
            ->where('user_id', $userId)
            ->exists();
    }

    public function findPlaceSummary(int $placeId): ?PlaceSummaryDTO
    {
        $place = Place::find($placeId);

        return $place ? PlaceSummaryDTO::fromModel($place) : null;
    }
}

