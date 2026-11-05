<?php

namespace App\Modules\Review\Contracts;

interface ReviewQueryInterface
{
    /**
     * Get the average rating of a place.
     */
    public function getPlaceAverageRating(int $placeId): float;

    /**
     * Get the total number of published reviews for a place.
     */
    public function getPlaceReviewCount(int $placeId): int;

    /**
     * Check if a user has already reviewed a place.
     */
    public function hasUserReviewedPlace(int $userId, int $placeId): bool;
}
