<?php

namespace App\Modules\Review\Services;

use App\Modules\Review\Contracts\ReviewQueryInterface;
use App\Modules\Review\Models\Review;

class ReviewQueryService implements ReviewQueryInterface
{
    public function getPlaceAverageRating(int $placeId): float
    {
        $avg = Review::where('place_id', $placeId)
            ->where('is_published', true)
            ->avg('rating');

        return round((float) ($avg ?? 0.0), 1);
    }

    public function getPlaceReviewCount(int $placeId): int
    {
        return Review::where('place_id', $placeId)
            ->where('is_published', true)
            ->count();
    }

    public function hasUserReviewedPlace(int $userId, int $placeId): bool
    {
        return Review::where('place_id', $placeId)
            ->where('user_id', $userId)
            ->exists();
    }
}
