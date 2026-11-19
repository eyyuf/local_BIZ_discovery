<?php

namespace App\Modules\Review\Policies;

use App\Modules\Identity\Models\User;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Models\ReviewMessage;

class ReviewMessagePolicy
{
    /**
     * Determine whether anyone can view the discussion messages of a review.
     * Rule: Public access is allowed for published reviews.
     */
    public function viewAny(?User $user, Review $review): bool
    {
        return (bool) $review->is_published;
    }

    /**
     * Determine whether the user can send a message in the review discussion.
     * Rule: Only the review author or the current place owner can participate.
     */
    public function create(User $user, Review $review): bool
    {
        if (! $review->is_published) {
            return false;
        }

        return $this->isParticipant($user, $review);
    }

    /**
     * Determine whether the user can update the message.
     * Rule: Only the original author of the message can edit it, provided they are still an authorized participant.
     */
    public function update(User $user, ReviewMessage $message, ?Review $review = null): bool
    {
        $review ??= $message->review;

        if (! $review || (int) $message->review_id !== (int) $review->id) {
            return false;
        }

        if ((int) $message->user_id !== (int) $user->id) {
            return false;
        }

        return $this->isParticipant($user, $review);
    }

    /**
     * Determine whether the user can delete the message.
     * Rule: Only the original author of the message can delete it, provided they are still an authorized participant.
     */
    public function delete(User $user, ReviewMessage $message, ?Review $review = null): bool
    {
        $review ??= $message->review;

        if (! $review || (int) $message->review_id !== (int) $review->id) {
            return false;
        }

        if ((int) $message->user_id !== (int) $user->id) {
            return false;
        }

        return $this->isParticipant($user, $review);
    }

    /**
     * Determine whether the user is an active participant (review author or current place owner).
     */
    public function isParticipant(User $user, Review $review): bool
    {
        $isReviewAuthor = (int) $user->id === (int) $review->user_id;
        $isCurrentPlaceOwner = (int) $user->id === (int) $review->place?->user_id;

        return $isReviewAuthor || $isCurrentPlaceOwner;
    }
}
