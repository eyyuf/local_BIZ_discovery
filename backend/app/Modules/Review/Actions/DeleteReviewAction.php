<?php

namespace App\Modules\Review\Actions;

use App\Modules\Review\Models\Review;

class DeleteReviewAction
{
    /**
     * Execute review deletion logic.
     */
    public function execute(Review $review): bool
    {
        return (bool) $review->delete();
    }
}
