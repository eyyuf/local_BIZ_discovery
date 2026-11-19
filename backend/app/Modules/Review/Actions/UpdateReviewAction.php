<?php

namespace App\Modules\Review\Actions;

use App\Modules\Review\Models\PlaceRating;
use App\Modules\Review\Models\Review;
use Illuminate\Support\Facades\DB;

class UpdateReviewAction
{
    /**
     * Update an existing written review and sync place rating.
     *
     * @param Review $review
     * @param array $data Validated data containing 'comment' and optional 'rating'
     * @return Review
     */
    public function execute(Review $review, array $data): Review
    {
        return DB::transaction(function () use ($review, $data) {
            $updates = [
                'comment' => $data['comment'],
            ];

            if (isset($data['rating'])) {
                $rating = (int) $data['rating'];
                $updates['rating'] = $rating;

                PlaceRating::updateOrCreate(
                    [
                        'place_id' => $review->place_id,
                        'user_id'  => $review->user_id,
                    ],
                    [
                        'rating'   => $rating,
                    ]
                );
            }

            $review->update($updates);
            $review->loadMissing(['author' => fn ($query) => $query->select(['id', 'name', 'avatar'])]);

            return $review;
        });
    }
}
