<?php

namespace App\Modules\Discovery\Contracts;

use App\Modules\Discovery\DTOs\NearbySearchDTO;
use Illuminate\Database\Eloquent\Collection;

interface DiscoveryQueryInterface
{
    public function searchNearby(NearbySearchDTO $dto): Collection;

    public function isPlaceBookmarked(int $userId, int $placeId): bool;
}

