<?php

namespace App\Modules\Review\Actions;

use App\Modules\Review\Models\Review;

class UpdateReviewAction
{
    /**
     * Update an existing written review's comment.
     *
     * @param Review $review
     * @param array $data Validated data containing 'comment'
     * @return Review
     */
    public function execute(Review $review, array $data): Review
    {
        $review->update([
            'comment' => $data['comment'],
        ]);

        $review->loadMissing(['author' => fn ($query) => $query->select(['id', 'name', 'avatar'])]);

        return $review;
    }
}
