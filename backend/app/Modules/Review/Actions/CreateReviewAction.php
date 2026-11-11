<?php

namespace App\Modules\Review\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Models\PlaceRating;
use App\Modules\Review\Models\Review;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Validation\ValidationException;

class CreateReviewAction
{
    /**
     * Execute review creation logic.
     *
     * @param Place $place
     * @param User $author
     * @param array $data Validated data containing 'rating' and 'comment'
     * @return Review
     *
     * @throws AuthorizationException
     * @throws ValidationException
     */
    public function execute(Place $place, User $author, array $data): Review
    {
        if ((int) $author->id === (int) $place->user_id) {
            throw new AuthorizationException('You cannot review your own place.');
        }

        if (! $place->is_active) {
            throw ValidationException::withMessages([
                'place' => ['Cannot submit reviews for an inactive place.'],
            ]);
        }

        $rating = (int) $data['rating'];

        // Synchronize or update the place_ratings table to keep aggregation in sync
        PlaceRating::updateOrCreate(
            [
                'place_id' => $place->id,
                'user_id'  => $author->id,
            ],
            [
                'rating'   => $rating,
            ]
        );

        return Review::create([
            'place_id'     => $place->id,
            'user_id'      => $author->id,
            'rating'       => $rating,
            'comment'      => $data['comment'],
            'is_published' => true,
        ]);
    }
}
