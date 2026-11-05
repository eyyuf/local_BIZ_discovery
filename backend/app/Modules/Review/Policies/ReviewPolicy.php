<?php

namespace App\Modules\Review\Policies;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Models\Review;

class ReviewPolicy
{
    /**
     * Determine whether the user can create a review for the place.
     * Rule: User cannot review their own place, and cannot double-review.
     */
    public function create(User $user, Place $place): bool
    {
        // Business owners cannot review their own business
        if ((int) $user->id === (int) $place->user_id) {
            return false;
        }

        // Prevent duplicate review
        return ! Review::where('place_id', $place->id)
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can delete the review.
     * Rule: Only author or admin can delete the review.
     */
    public function delete(User $user, Review $review): bool
    {
        return (int) $user->id === (int) $review->user_id;
    }
}
