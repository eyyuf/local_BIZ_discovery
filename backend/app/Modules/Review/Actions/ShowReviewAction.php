<?php

namespace App\Modules\Review\Actions;

use App\Modules\Review\Models\Review;

class ShowReviewAction
{
    /**
     * Retrieve a single published review with author details and discussion messages.
     */
    public function execute(Review $review): Review
    {
        if (! $review->is_published) {
            abort(404, 'Review not found.');
        }

        $review->loadMissing([
            'author'          => fn ($query) => $query->select(['id', 'name', 'avatar']),
            'messages.author' => fn ($query) => $query->select(['id', 'name', 'avatar']),
        ]);

        return $review;
    }
}
