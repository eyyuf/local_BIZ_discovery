<?php

namespace App\Modules\Discovery\Services;

use App\Modules\Discovery\Actions\GetNearbyPlacesAction;
use App\Modules\Discovery\Contracts\DiscoveryQueryInterface;
use App\Modules\Discovery\DTOs\NearbySearchDTO;
use App\Modules\Discovery\Models\PlaceBookmark;
use Illuminate\Database\Eloquent\Collection;

class DiscoveryQueryService implements DiscoveryQueryInterface
{
    public function __construct(
        private GetNearbyPlacesAction $nearbyAction
    ) {}

    public function searchNearby(NearbySearchDTO $dto): Collection
    {
        return $this->nearbyAction->execute(
            lat: $dto->lat,
            lng: $dto->lng,
            radiusKm: $dto->radiusKm,
            limit: $dto->limit,
        );
    }

    public function isPlaceBookmarked(int $userId, int $placeId): bool
    {
        return PlaceBookmark::where('user_id', $userId)
            ->where('place_id', $placeId)
            ->exists();
    }
}

