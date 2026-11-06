<?php

namespace App\Modules\Review\Policies;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Models\Review;

class ReviewPolicy
{
    /**
     * Determine whether the user can create a review for the place.
     * Business rules:
     * - Place must be active.
     * - Place owner cannot review their own place.
     * - Multiple written reviews from the same user for the same place are allowed.
     */
    public function create(User $user, Place $place): bool
    {
        if (! $place->is_active) {
            return false;
        }

        if ((int) $user->id === (int) $place->user_id) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can update the review.
     * Rule: Only the review author can update their review.
     */
    public function update(User $user, Review $review): bool
    {
        return (int) $user->id === (int) $review->user_id;
    }

    /**
     * Determine whether the user can delete the review.
     * Rule: Only the review author can delete their review.
     */
    public function delete(User $user, Review $review): bool
    {
        return (int) $user->id === (int) $review->user_id;
    }
}
