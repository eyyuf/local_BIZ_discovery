<?php

namespace App\Modules\Place\Contracts;

use App\Modules\Place\DTOs\PlaceSummaryDTO;

interface PlaceQueryInterface
{
    public function isPlaceOpen(int $placeId): bool;

    public function isPlaceOwner(int $userId, int $placeId): bool;

    public function findPlaceSummary(int $placeId): ?PlaceSummaryDTO;
}

