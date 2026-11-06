<?php

namespace App\Modules\Review\Actions;

use App\Modules\Review\Models\PlaceRating;

class GetPlaceRatingSummaryAction
{
    /**
     * Minimum eligible ratings required to publish an average rating.
     */
    public const MINIMUM_RATINGS_THRESHOLD = 5;

    /**
     * Account age in days required for a rating to be eligible.
     */
    public const ELIGIBILITY_DAYS_THRESHOLD = 7;

    /**
     * Calculate eligible rating count and public average rating for a place.
     *
     * @param int $placeId
     * @return array{average_rating: ?float, total_ratings: int}
     */
    public function execute(int $placeId): array
    {
        $cutoff = now()->subDays(self::ELIGIBILITY_DAYS_THRESHOLD);

        $aggregation = PlaceRating::query()
            ->where('place_ratings.place_id', $placeId)
            ->join('users', 'users.id', '=', 'place_ratings.user_id')
            ->where('users.created_at', '<=', $cutoff)
            ->selectRaw('COUNT(*) as total_ratings, AVG(place_ratings.rating) as avg_rating')
            ->first();

        $totalRatings = (int) ($aggregation->total_ratings ?? 0);
        $averageRating = ($totalRatings >= self::MINIMUM_RATINGS_THRESHOLD && $aggregation->avg_rating !== null)
            ? round((float) $aggregation->avg_rating, 1)
            : null;

        return [
            'average_rating' => $averageRating,
            'total_ratings'  => $totalRatings,
        ];
    }
}
