<?php

namespace App\Modules\Review\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Models\ReviewMessage;

class CreateReviewMessageAction
{
    /**
     * Create a new message in the review discussion.
     *
     * @param Review $review
     * @param User $user
     * @param string $message
     * @return ReviewMessage
     */
    public function execute(Review $review, User $user, string $message): ReviewMessage
    {
        if (! $review->is_published) {
            abort(404, 'Review not found.');
        }

        return $review->messages()->create([
            'user_id' => $user->id,
            'message' => $message,
        ]);
    }
}
