<?php

namespace App\Modules\Review\Contracts;

interface ReviewQueryInterface
{
    /**
     * Get the average rating of a place (null if below threshold).
     */
    public function getPlaceAverageRating(int $placeId): ?float;

    /**
     * Get the total number of published reviews for a place.
     */
    public function getPlaceReviewCount(int $placeId): int;

    /**
     * Check if a user has already reviewed a place.
     */
    public function hasUserReviewedPlace(int $userId, int $placeId): bool;

    /**
     * Get the rating summary (average_rating and total_ratings) for a place.
     *
     * @return array{average_rating: ?float, total_ratings: int}
     */
    public function getPlaceRatingSummary(int $placeId): array;

    /**
     * Attach aggregated rating summaries to a single Place, Collection, or Paginator in a single batch query.
     */
    public function attachRatingSummaries(mixed $places): void;
}
