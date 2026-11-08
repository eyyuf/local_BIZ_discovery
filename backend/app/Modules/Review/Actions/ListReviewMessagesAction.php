<?php

namespace App\Modules\Review\Actions;

use App\Modules\Review\Models\Review;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListReviewMessagesAction
{
    /**
     * Retrieve paginated public discussion messages for a published review.
     *
     * @param Review $review
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function execute(Review $review, int $perPage = 15): LengthAwarePaginator
    {
        if (! $review->is_published) {
            abort(404, 'Review not found.');
        }

        return $review->messages()
            ->with(['author' => fn ($query) => $query->select(['id', 'name', 'avatar'])])
            ->oldest()
            ->paginate($perPage);
    }
}
