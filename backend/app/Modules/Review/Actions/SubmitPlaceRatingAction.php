<?php

namespace App\Modules\Review\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Models\PlaceRating;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Validation\ValidationException;

class SubmitPlaceRatingAction
{
    /**
     * Submit or update a star rating for a place.
     *
     * @param Place $place
     * @param User $user
     * @param int $rating
     * @return PlaceRating
     *
     * @throws AuthorizationException
     * @throws ValidationException
     */
    public function execute(Place $place, User $user, int $rating): PlaceRating
    {
        if ((int) $user->id === (int) $place->user_id) {
            throw new AuthorizationException('You cannot rate your own place.');
        }

        if (! $place->is_active) {
            throw ValidationException::withMessages([
                'place' => ['Cannot submit ratings for an inactive place.'],
            ]);
        }

        return PlaceRating::updateOrCreate(
            [
                'place_id' => $place->id,
                'user_id'  => $user->id,
            ],
            [
                'rating'   => $rating,
            ]
        );
    }
}
