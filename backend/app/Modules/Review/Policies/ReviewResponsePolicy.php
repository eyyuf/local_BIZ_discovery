<?php

namespace App\Modules\Review\Policies;

use App\Modules\Identity\Models\User;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Models\ReviewResponse;

class ReviewResponsePolicy
{
    /**
     * Determine whether the user can respond to the review.
     * Rule: Only the verified owner of the place that received the review can respond.
     */
    public function create(User $user, Review $review): bool
    {
        return (int) $user->id === (int) $review->place?->user_id;
    }

    /**
     * Determine whether the user can delete the response.
     */
    public function delete(User $user, ReviewResponse $response): bool
    {
        return (int) $user->id === (int) $response->user_id;
    }
}
